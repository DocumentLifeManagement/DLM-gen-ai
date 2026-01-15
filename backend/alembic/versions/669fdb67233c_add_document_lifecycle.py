"""add document lifecycle

Revision ID: 669fdb67233c
Revises: 2d97298771ca
Create Date: 2026-01-14 13:18:33.653767

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '669fdb67233c'
down_revision: Union[str, Sequence[str], None] = '2d97298771ca'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:

    op.create_table(
        'document_lifecycle',
        sa.Column('id', sa.Integer(), primary_key=True),
        sa.Column('document_id', sa.Integer(), nullable=False),
        sa.Column('from_state', sa.String(), nullable=False),
        sa.Column('to_state', sa.String(), nullable=False),
        sa.Column('actor_type', sa.String(), nullable=True),
        sa.Column('actor_id', sa.String(), nullable=True),
        sa.Column('timestamp', sa.DateTime(), nullable=True),
        sa.ForeignKeyConstraint(['document_id'], ['documents.id']),
    )



def downgrade() -> None:
    op.drop_table('document_lifecycle')
    
