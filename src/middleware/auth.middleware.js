export const auth = (req, res, next)=>{
    if(req.session.userName){
        res.locals.userName = req.session.userName
        next()
    } 
    else{
        res.redirect('/login')
    }
}