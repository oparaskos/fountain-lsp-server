export const simpleNameTransform = (str: string) => {
    return str.toLocaleLowerCase().normalize();
};
export const stripSpecial = (str: string) => {
    return str.replace(/[!"#$%&'()*+,-./:;<=>?@[\]^_`{|}~]/g, '');
};
