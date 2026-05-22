import { useEffect } from "react";

interface MetadataProps {
    title?: string;
    description?: string;
    image?: string;
    url?: string;
    type?: "website" | "article";
}

export function usePageMetadata({
    title,
    description,
    image,
    url,
    type = "website"
}: MetadataProps) {
    useEffect(() => {
        if (!title) return;

        const oldTitle = document.title;
        document.title = title.includes("SEMEAR") ? title : `${title} | SEMEAR`;

        const setMetaTag = (attributeName: string, attributeValue: string, content: string) => {
            let element = document.querySelector(`meta[${attributeName}="${attributeValue}"]`);
            let isNew = false;
            if (!element) {
                element = document.createElement("meta");
                element.setAttribute(attributeName, attributeValue);
                document.head.appendChild(element);
                isNew = true;
            }
            const previousContent = element.getAttribute("content");
            element.setAttribute("content", content);
            return { element, isNew, previousContent };
        };

        const updates: { element: Element; isNew: boolean; previousContent: string | null }[] = [];

        const applyUpdate = (attrName: string, attrVal: string, content: string) => {
            updates.push(setMetaTag(attrName, attrVal, content));
        };

        if (description) {
            applyUpdate("name", "description", description);
        }

        applyUpdate("property", "og:type", type);
        applyUpdate("property", "og:title", title.includes("SEMEAR") ? title : `${title} | SEMEAR`);
        if (description) {
            applyUpdate("property", "og:description", description);
        }
        if (image) {
            applyUpdate("property", "og:image", image);
        }
        if (url) {
            applyUpdate("property", "og:url", url);
        }

        applyUpdate("property", "twitter:card", "summary_large_image");
        applyUpdate("property", "twitter:title", title.includes("SEMEAR") ? title : `${title} | SEMEAR`);
        if (description) {
            applyUpdate("property", "twitter:description", description);
        }
        if (image) {
            applyUpdate("property", "twitter:image", image);
        }
        if (url) {
            applyUpdate("property", "twitter:url", url);
        }

        return () => {
            document.title = oldTitle;
            for (const update of updates) {
                if (update.isNew) {
                    update.element.remove();
                } else if (update.previousContent !== null) {
                    update.element.setAttribute("content", update.previousContent);
                } else {
                    update.element.removeAttribute("content");
                }
            }
        };
    }, [title, description, image, url, type]);
}
