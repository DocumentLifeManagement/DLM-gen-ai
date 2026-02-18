import React from "react";
import clsx from "clsx";

export default function Section({ children, className, id }) {
    return (
        <section
            id={id}
            className={clsx(
                "py-20 px-6 md:px-12 lg:px-24 mx-auto max-w-7xl",
                className
            )}
        >
            {children}
        </section>
    );
}
