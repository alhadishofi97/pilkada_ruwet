import React, { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

export default function AuthMiddleware({ children }) {
    const navigate = useNavigate();

    useEffect(() => {
        if (!localStorage.getItem('IS_LOGIN')) {
            navigate('/login');
        }
    })
    return children;
}
