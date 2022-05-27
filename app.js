/* app.use(cors()); */

/* const cookieParser = require('cookie-parser'); */


// para recibir los datos del formulario
/* app.use(express.json());
app.use(express.urlencoded({extended:false}));
 */
//rutas
/* app.use(router,require('./routes/router'));
app.use(router,require('./routes/ticketsrouter'));
 */
/* //para trabajar con cookies
app.use(cookieParser()); */


const Server = require('./config/server');
const app = new Server();
app.listen((req,res)=>{
    console.log('server running ok');
});

