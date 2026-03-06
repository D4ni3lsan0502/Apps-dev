/**
 * client.js
 * Módulo para centralizar todas as requisições à API do BarberPro.
 */

// Define a URL base da nossa API. Se o endereço do servidor mudar, só precisamos alterar aqui.
const API_BASE_URL = 'http://localhost:3000/api'; // Use a porta que você configurou no server.js

/**
 * Função genérica para realizar chamadas 'fetch'.
 * @param {string} endpoint - O endpoint da API (ex: '/login').
 * @param {object} options - As opções para a requisição fetch (method, headers, body).
 * @returns {Promise<any>} - A resposta da API em formato JSON.
 */
async function request(endpoint, options) {
    try {
        const response = await fetch(`${API_BASE_URL}${endpoint}`, options);

        if (!response.ok) {
            // Se a resposta não for bem-sucedida, tenta extrair a mensagem de erro da API.
            const errorData = await response.json();
            throw new Error(errorData.message || `Erro HTTP: ${response.status}`);
        }

        return await response.json();
    } catch (error) {
        console.error(`Erro na requisição para ${endpoint}:`, error);
        // Re-lança o erro para que a função que chamou possa tratá-lo.
        throw error;
    }
}

/**
 * Realiza o login de um usuário (cliente ou barbeiro).
 * @param {string} email - O email do usuário.
 * @param {string} senha - A senha do usuário.
 * @param {string} tipo - O tipo de usuário ('cliente' ou 'barbeiro').
 * @returns {Promise<object>} - Os dados do usuário logado.
 */
export async function login(email, senha, tipo) {
    return request('/login', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, senha, tipo }),
    });
}

/**
 * Cria um novo agendamento.
 * @param {object} dadosAgendamento - O objeto com os detalhes do agendamento.
 * @returns {Promise<object>} - A confirmação do agendamento.
 */
export async function criarAgendamento(dadosAgendamento) {
    // Aqui você pegaria o token do usuário do localStorage para autenticação
    // const token = localStorage.getItem('authToken'); 
    return request('/agendamentos', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            // 'Authorization': `Bearer ${token}` // Exemplo de como enviar um token
        },
        body: JSON.stringify(dadosAgendamento),
    });
}

// Você pode adicionar outras funções aqui conforme a API for crescendo:
/*
export async function buscarBarbeiros() {
    return request('/barbeiros', { method: 'GET' });
}

export async function buscarMeusAgendamentos() {
    return request('/meus-agendamentos', { method: 'GET', headers: ... });
}
*/