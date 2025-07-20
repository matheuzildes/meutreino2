// src/lib/date-utils.ts

/**
 * Retorna a data local atual no formato 'AAAA-MM-DD'.
 */
export const getLocalDateString = (date = new Date()): string => {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
};

/**
 * Converte uma string 'AAAA-MM-DD' para um objeto Date, forçando o fuso horário local.
 */
export const parseLocalDateString = (dateString: string): Date => {
    if (!dateString || !/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
        return new Date();
    }
    const parts = dateString.split('-');
    const year = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10) - 1;
    const day = parseInt(parts[2], 10);
    return new Date(year, month, day);
};

/**
 * Formata a data para exibição: "Hoje", "Ontem" ou DD/MM/AAAA.
 */
export const formatDisplayDate = (dateString: string): string => {
    const date = parseLocalDateString(dateString);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const targetDate = new Date(date);
    targetDate.setHours(0, 0, 0, 0);

    const diffTime = today.getTime() - targetDate.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Hoje';
    if (diffDays === 1) return 'Ontem';
    
    // Para qualquer outra data, formata como DD/MM/AAAA
    return date.toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
    });
};