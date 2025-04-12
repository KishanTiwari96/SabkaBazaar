import { Hono } from 'hono'
import { cors } from 'hono/cors'
import authRoutes from './routes/auth'
import productRoutes from './routes/product'
import cartRoutes from './routes/cart'
import orderRoutes from './routes/order'
import reviewsRoutes from './routes/review'


const app = new Hono<{
  Bindings : {  // specifying the type of env variable
    DATABASE_URL : string,
    JWT_SECRET : string
  }
}>()

app.use(
  '*',
  cors({
    origin: 'http://127.0.0.1:5173',
  credentials: true
  })
)

app.route("/",authRoutes);
app.route("/",cartRoutes);
app.route("/",productRoutes);
app.route("/",orderRoutes);
app.route("/",reviewsRoutes);

export default app
