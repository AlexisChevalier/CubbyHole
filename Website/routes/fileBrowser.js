module.exports = {
    /**
     * GET file browserpage.
     */
    fileBrowserPage: function(req, res){
        res.render('files', { title: 'My files' });
    }
};