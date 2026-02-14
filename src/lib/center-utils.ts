
export interface Center {
    rowid: number;
    label: string;
    latitude: number;
    longitude: number;
    radius: number;
}

const PROJECT_PREFIX = '[PROYECTO] ';

export const isProject = (label: string): boolean => {
    return label.startsWith(PROJECT_PREFIX);
};

export const getCleanLabel = (label: string): string => {
    if (isProject(label)) {
        return label.substring(PROJECT_PREFIX.length);
    }
    return label;
};

export const addProjectPrefix = (label: string): string => {
    if (isProject(label)) return label;
    return `${PROJECT_PREFIX}${label}`;
};

export const removeProjectPrefix = (label: string): string => {
    return getCleanLabel(label);
};

export const formatLabelForSave = (label: string, isProject: boolean): string => {
    const clean = removeProjectPrefix(label);
    return isProject ? addProjectPrefix(clean) : clean;
};
