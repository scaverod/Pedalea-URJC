const jwt = require('jsonwebtoken');

const auth = (req, res, next) => {
    const token = req.header('x-auth-token');

    if (!token) {
        return res.status(401).json({ message: 'Sin token, autorización denegada.' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded; // Attach user payload to the request object
        next();
    } catch (error) {
        res.status(401).json({ message: 'El token no es válido.' });
    }
};

const authorize = (roles = []) => {
    if (typeof roles === 'string') {
        roles = [roles];
    }

    return (req, res, next) => {
        if (!req.user || (roles.length > 0 && !roles.includes(req.user.role))) {
            return res.status(403).json({ message: 'Prohibido: No tienes los permisos necesarios.' });
        }
        next();
    };
};

module.exports = { auth, authorize };
