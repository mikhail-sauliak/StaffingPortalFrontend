import React, { useState } from 'react';
import { read, utils } from 'xlsx';
import { apiWithAuth } from './api';

const FileUpload = ({ onUploadSuccess }) => {
    const [file, setFile] = useState(null);

    const handleFileChange = (e) => {
        setFile(e.target.files[0]);
    };

    const handleFileUpload = async () => {
        if (!file) {
            alert("Please select a file before uploading.");
            return;
        }

        const reader = new FileReader();
        reader.onload = async (e) => {
            try {
                const data = e.target.result;
                const workbook = read(data, { type: 'binary' });
                const sheetName = workbook.SheetNames[0];
                const jsonData = utils.sheet_to_json(workbook.Sheets[sheetName]);
                await processAndUploadData(jsonData);
            } catch (error) {
                console.error('Error reading file:', error);
            }
        };
        reader.readAsBinaryString(file);
    };

    const excelDateToJSDate = (excelDate) => {
        return new Date((excelDate - (25567 + 2)) * 86400 * 1000).toISOString();
    };
    
    const processAndUploadData = async (jsonData) => {
        for (const data of jsonData) {
            const personData = {
                firstName: data.FirstName,
                lastName: data.LastName,
                location: data.Location,
                divisionManagerId: data.DivisionManagerId,
                talentManagerId: data.TalentManagerId,
                availableFrom: data.AvailableFrom ? excelDateToJSDate(data.AvailableFrom) : null,
                techStack: data.TechStack,
                stream: data.Stream,
                level: data.Level,
                TMAware: "Not",
                isDismissed: false, 
                assignmentExistsInGCP: true
            };

            const salaryReviewData = {
                reviewDate: data.ReviewDate ? excelDateToJSDate(data.ReviewDate) : null,
                justification: "Annual",
                reviewResult: "Aprooved",
                oldSalary: parseFloat(data.OldSalary),
                proposedSalary: parseFloat(data.ProposedSalary),
                isApproved: true,
                currency: data.Currency,
                contractType: data.ContractType,
                divisionManagerComments: "Good", 
                talentManagerComments: "Good feedbacks"
            };

            try {
                const createdPersonResponse = await apiWithAuth.post('people', personData);
                const createdPerson = createdPersonResponse.data;
                await apiWithAuth.post('salaryreview', { ...salaryReviewData, personId: createdPerson.id });

                if (jsonData.indexOf(data) === jsonData.length - 1) {
                    onUploadSuccess();
                }
            } catch (error) {
                console.error('Error processing data:', error);
            }
        }
    };

    return (
        <div>
            <input type="file" accept=".ods" onChange={handleFileChange} />
            <button onClick={handleFileUpload}>Upload</button>
        </div>
    );
};

export default FileUpload;
