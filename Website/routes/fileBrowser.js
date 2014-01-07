module.exports = {
    /**
     * GET file browserpage.
     */
    fileBrowserPage: function(req, res){
        res.render('index', { title: 'CubbyHole' });
    }
};