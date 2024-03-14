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

    // если дни отрицательные, уменьшаем месяцы на 1 и вычисляем дни заново
    if (days < 0) {
        months -= 1;
        const previousMonth = new Date(now.getFullYear(), now.getMonth(), 0); // последний день предыдущего месяца
        days += previousMonth.getDate();
    }

    // если месяцы отрицательные, уменьшаем года на 1 и вычисляем месяцы заново
    if (months < 0) {
        years -= 1;
        months += 12; // добавляем месяцы от предыдущего года
    }

    // делаем строку вывода
    let result = "";
    if (years > 0) result += `${years} ${years === 1 ? 'year' : 'years'}`;
    if (months > 0) result += `${result ? ', ' : ''}${months} ${months === 1 ? 'month' : 'months'}`;
    if (days > 0) result += `${result ? ', ' : ''}${days} ${days === 1 ? 'day' : 'days'}`;

    return result || '0 days'; // возвращаем 0 дней, если разница между датами меньше дня
};