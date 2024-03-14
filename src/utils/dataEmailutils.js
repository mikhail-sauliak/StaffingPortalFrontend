import { parseISO, format, addMonths } from 'date-fns';

export const formatDataForEmailTable = (selectedProposalsData, people) => {
    return selectedProposalsData.map(proposal => {
        console.log('selectedProposalsData is: ', selectedProposalsData);
   
        const review = proposal.review;
        const adjustmentNew = proposal.adjustment ? proposal.overflow : 'N/A';

        const effectiveFromDate = format(addMonths(new Date(), 1), 'MM/yyyy');
        const whenReceivedDate = format(addMonths(new Date(), 2), 'MM/yyyy');
        const newSalary = proposal.currentSalary + adjustmentNew; 
        const salaryChangeText = adjustmentNew >= 0 ? `(+${proposal.adjustment})=` : adjustmentNew;
        const dm = people.find(p => p.id === proposal.divisionManagerId);
        const tm = people.find(p => p.id === proposal.talentManagerId);

        return {
            id: proposal.id,
            name: `${proposal.firstName} ${proposal.lastName}`,
            location: proposal.location,
            jobTitle: proposal.level,
            lastReviewDate: review ? format(parseISO(review.reviewDate), 'MM/yyyy') : 'N/A',
            typeOfContract: review ? review.contractType : 'N/A',
            currentSalary: `${proposal.currentSalary} (${proposal.currency})`,
            salaryChange: `${salaryChangeText} ${proposal.proposedNewSalary} (${proposal.currency})`,
            dm: `${dm.firstName} ${dm.lastName}`, 
            tm: `${tm.firstName} ${tm.lastName}`, 
            effectiveFrom: effectiveFromDate,
            whenReceived: whenReceivedDate,
            reasonForReview: '',
            comments: '', 
        };
    });
};