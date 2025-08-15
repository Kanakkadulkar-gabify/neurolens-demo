export const getAgeSlab = age => {
    if (age < 1) return "Infants: 8–12 months";
    if (age <= 2) return "Toddlers: 1–2 years";
    if (age <= 5) return "Preschool: 3–5 years";
    if (age <= 10) return "School-age: 6–10 years";
    if (age <= 17) return "Pre-teens & Teens: 11–17 years";
    return "Adults: 18+ years";
};