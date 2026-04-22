// prettier-ignore
export default function (type, parent, classList, attributes) {
    const element = document.createElement(`${type}`);
    if (classList) {
        if (!Array.isArray(classList)) {
            classList = classList.split(" ")
        }
        for (const i of classList) {
            element.classList.add(`${i}`);
        }
    }
    if (typeof(attributes) === "object") {
        const arrayOfKeys = Object.keys(attributes)
        for (let i = 0; i < arrayOfKeys.length; i++) {
            const currentKey = arrayOfKeys[i];
            element[currentKey] = attributes[currentKey];
        }
    }
    if (parent) {
        parent.appendChild(element);
    }
    return element;
}
