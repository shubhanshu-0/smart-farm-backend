const express = require('express');
const mongoose = require('mongoose');
const auth = require('./routes/auth.js');

const farmerSignupRoute = require('./routes/farmer/signup');
const secretarySignupRoute = require('./routes/secretary/signup');
const adminSignupRoute = require('./routes/admin/signup');

// const farmerRoutes = require('./routes/farmer/index.js');
// const secretaryRoutes = require('./routes/secretary/index.js'); 
// const adminRoutes = require('./routes/admin/index.js'); 

const app = express();
const connectDB = require('./config/db.js');
const bodyParser = require('body-parser');


const session = require('express-session');
const isAuthenticated = require('./middlewares/authMiddleware.js');


// require('./config/dotenv.js').config();

app.use(express.json()); 

app.use(session({
    secret: 'secretKey', // secret key 
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false } 
}));

connectDB();

app.use('/api/auth', auth);

//public routes
app.use('/api/farmer/signup', farmerSignupRoute);
app.use('/api/secretary/signup', secretarySignupRoute);
app.use('/api/admin/signup', adminSignupRoute);

//protected routes
app.use('/api/farmer', isAuthenticated, require('./routes/farmer/index'));
app.use('/api/secretary',isAuthenticated, require('./routes/secretary/index'));
app.use('/api/admin', isAuthenticated, require('./routes/admin/index'));

app.get('api/logout' , (req , res) => {
    // replace sessions with jwt then make this route
});

// const PORT = process.env.PORT || 4000; 
const PORT = 4000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
