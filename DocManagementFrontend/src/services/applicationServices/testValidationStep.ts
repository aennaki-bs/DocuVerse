import api from '../api';

const testValidationStep = {
    getAllTestValidationSteps: async () => {
        try {
            console.log('TestValidationSteps');
            // const response = await api.get('/');
            // return response.data;
        } catch (error) {
            console.error('Error fetching test validation steps:', error);
            throw error;
        }
    }
};

export default testValidationStep;

