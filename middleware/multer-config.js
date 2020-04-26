const multer = require('multer');

exports.fileStorage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, 'images')
    },
    filename: function (req, file, cb) {
      const uniquePrefix = Date.now() + '-' + Math.round(Math.random() * 1E9)
      cb(null, uniquePrefix+ '-'+ file.originalname)
     // cb(null, file.filename + '-' + uniqueSuffix)
    }
  })

  exports.fileFilter = (req, file, cb)=>{
      console.log(file.mimetype,'8888888')
      if(file.mimetype === 'image/png' || file.mimetype === 'image/jpeg' || file.mimetype === 'image/jpg'){
        console.log('inside mime')
        cb(null, true)
      }else{
        console.log('false mime')
          cb(null, false)
      }
    
  }