module.exports = {
    /*
     * GET account page.
     */
    account: function(req, res){
        res.render('account', { title: 'CubbyHole' });
    },
};