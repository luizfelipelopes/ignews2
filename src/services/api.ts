import axios from "axios";

export const api = axios.create({
    baseURL: '/api' // intercepta as requisicoes com api na url
});