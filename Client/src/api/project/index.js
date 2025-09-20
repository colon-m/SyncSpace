import axiosInstance from '../axios'

export const fetchProjectData = async () => {
    try {
        const response = await axiosInstance.get('/project/list');
        return response;
    } catch (error) {
        console.error('Error fetching project data:', error);
        return { code: 500, message: 'Internal Server Error' };
    }
};
