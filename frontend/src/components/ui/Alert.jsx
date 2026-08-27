import { useState } from "react";

export function Alert({
    children,
    variant = "info",
    closable = false
}) {

    const [visible, setVisible] = useState(true);

    if (!visible) {
        return null;
    }

    const variants = {

        success:
            "border-green-200 bg-green-50 text-green-800",

        warning:
            "border-yellow-200 bg-yellow-50 text-yellow-800",

        info:
            "border-blue-200 bg-blue-50 text-blue-800",

        error:
            "border-red-200 bg-red-50 text-red-800"

    };

    return (

        <div
            className={`
                mb-4
                flex
                items-start
                justify-between
                gap-4
                rounded-xl
                border
                p-4
                ${variants[variant]}
            `}
        >

            <div className="text-sm">

                {children}

            </div>

            {closable && (

                <button
                    type="button"
                    onClick={() => setVisible(false)}
                    className="
                        text-lg
                        font-bold
                        leading-none
                        opacity-70
                        transition
                        hover:opacity-100
                    "
                    aria-label="Fechar aviso"
                >

                    ×

                </button>

            )}

        </div>

    );

}