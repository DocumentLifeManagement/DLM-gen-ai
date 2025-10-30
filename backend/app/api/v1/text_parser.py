def build_maps(blocks):
    block_map, key_map, value_map, line_blocks, table_blocks = {}, {}, {}, [], []
    for b in blocks:
        block_map[b["Id"]] = b
        bt = b.get("BlockType")
        if bt == "LINE":
            line_blocks.append(b)
        elif bt == "TABLE":
            table_blocks.append(b)
        elif bt == "KEY_VALUE_SET":
            if "EntityTypes" in b and "KEY" in b["EntityTypes"]:
                key_map[b["Id"]] = b
            else:
                value_map[b["Id"]] = b
    return block_map, key_map, value_map, line_blocks, table_blocks

def get_text_from_block(block, block_map):
    text_parts = []
    for rel in block.get("Relationships", []):
        if rel["Type"] == "CHILD":
            for cid in rel["Ids"]:
                child = block_map.get(cid)
                if not child:
                    continue
                if child["BlockType"] == "WORD":
                    text_parts.append(child.get("Text", ""))
                elif child["BlockType"] == "SELECTION_ELEMENT":
                    if child.get("SelectionStatus") == "SELECTED":
                        text_parts.append("[X]")
    return " ".join([t for t in text_parts if t])

def find_value_block(key_block, value_map):
    for rel in key_block.get("Relationships", []):
        if rel["Type"] == "VALUE":
            for vid in rel["Ids"]:
                vb = value_map.get(vid)
                if vb:
                    return vb
    return None

def extract_key_value_pairs(blocks):
    block_map, key_map, value_map, _, _ = build_maps(blocks)
    kvs = []
    for key_id, key_block in key_map.items():
        val_block = find_value_block(key_block, value_map)
        k_text = get_text_from_block(key_block, block_map).strip()
        v_text = get_text_from_block(val_block, block_map).strip() if val_block else ""
        if k_text:
            kvs.append({"key": k_text, "value": v_text, "key_conf": key_block.get("Confidence"), "val_conf": val_block.get("Confidence") if val_block else None})
    return kvs

def extract_lines(blocks):
    block_map, _, _, line_blocks, _ = build_maps(blocks)
    lines = []
    for b in line_blocks:
        lines.append({
            "text": b.get("Text", ""),
            "confidence": b.get("Confidence"),
            "bbox": b["Geometry"]["BoundingBox"],
            "page": b.get("Page", 1)
        })
    return lines

def extract_tables(blocks):
    block_map, _, _, _, table_blocks = build_maps(blocks)
    tables = []
    for t in table_blocks:
        # gather cells
        cells = []
        for rel in t.get("Relationships", []):
            if rel["Type"] == "CHILD":
                for cid in rel["Ids"]:
                    cell = block_map.get(cid)
                    if cell and cell.get("BlockType") == "CELL":
                        txt = get_text_from_block(cell, block_map).strip()
                        cells.append({
                            "row": cell.get("RowIndex"),
                            "col": cell.get("ColumnIndex"),
                            "rowspan": cell.get("RowSpan", 1),
                            "colspan": cell.get("ColumnSpan", 1),
                            "text": txt,
                            "confidence": cell.get("Confidence")
                        })
        # materialize into 2D grid
        max_row = max([c["row"] for c in cells], default=0)
        max_col = max([c["col"] for c in cells], default=0)
        grid = [["" for _ in range(max_col)] for _ in range(max_row)]
        for c in cells:
            grid[c["row"]-1][c["col"]-1] = c["text"]
        tables.append({"page": t.get("Page", 1), "cells": cells, "grid": grid})
    return tables
