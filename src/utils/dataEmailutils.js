import { parseISO, format, addMonths } from 'date-fns';

export const formatDataForEmailTable = (selectedProposalsData, people) => {
    return selectedProposalsData.map(proposal => {
        const adjustment = proposal.adjustment !== null && proposal.adjustment !== undefined && proposal.adjustment !== 0
            ? proposal.adjustment
            : 0;

        const adjustmentNew = (proposal.overflow !== null && proposal.overflow !== undefined && proposal.overflow !== 0)
            ? -Math.abs(proposal.overflow)
            : adjustment;

        const effectiveFromDate = format(addMonths(new Date(), 1), 'MM/yyyy');
        const whenReceivedDate = format(addMonths(new Date(), 2), 'MM/yyyy');

        const newSalary = proposal.currentSalary + adjustmentNew;        
       
        const salaryChangeText = adjustmentNew > 0 ? `(+${adjustmentNew})` : `(${adjustmentNew})`;

        const dm = people.find(p => p.id === proposal.divisionManagerId);
        const tm = people.find(p => p.id === proposal.talentManagerId);

        return {
            id: proposal.id,
            name: `${proposal.firstName} ${proposal.lastName}`,
            location: proposal.location,
            jobTitle: proposal.level,
            lastReviewDate: proposal.review ? format(parseISO(proposal.review.reviewDate), 'MM/yyyy') : 'N/A',
            typeOfContract: proposal.review ? proposal.review.contractType : 'N/A',
            currentSalary: `${proposal.currentSalary} (${proposal.currency})`,
            salaryChange: `${salaryChangeText} ${newSalary} (${proposal.currency})`,
            dm: dm ? `${dm.firstName} ${dm.lastName}` : 'N/A', 
            tm: tm ? `${tm.firstName} ${tm.lastName}` : 'N/A', 
            effectiveFrom: effectiveFromDate,
            whenReceived: whenReceivedDate,
            reasonForReview: '',
            comments: '', 
        };
    });
};
