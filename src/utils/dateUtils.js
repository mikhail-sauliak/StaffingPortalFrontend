import { parseISO, format } from 'date-fns';

export const getLastSRTimerange = (lastReviewDate) => {
    
    if (!lastReviewDate) {
        return "N/A";
    }

    const now = new Date();
    const lastReview = parseISO(lastReviewDate);
    let years = now.getFullYear() - lastReview.getFullYear();
    let months = now.getMonth() - lastReview.getMonth();
    let days = now.getDate() - lastReview.getDate();

    if (days < 0) {
        months -= 1;
        const previousMonth = new Date(now.getFullYear(), now.getMonth(), 0);
        days += previousMonth.getDate();
    }

    if (months < 0) {
        years -= 1;
        months += 12;
    }

    let result = "";
    if (years > 0) result += `${years} ${years === 1 ? 'year' : 'years'}`;
    if (months > 0) result += `${result ? ', ' : ''}${months} ${months === 1 ? 'month' : 'months'}`;
    if (days > 0) result += `${result ? ', ' : ''}${days} ${days === 1 ? 'day' : 'days'}`;

    return result || '0 days';
};