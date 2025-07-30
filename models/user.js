//Hash password before saving
userSchema.pre('save', async function(next) {
    if(!this.isModified('password')) return next();
    this.password = await bccrypt.hash(this.password, 10);
     next();
});
//password verification method
userSchema.methods.comparePassword = async function(candidatePassword) {
    return bccrypt.compare(candidatePassword,  this.password)
};
