const userRoutes = require('./routes/userRoutes');
const adminRoutes = require('./routes/adminRoutes');

app.use('/api/user', userRoutes);
app.use('/api/admin', adminRoutes);
