import { Hono } from 'hono'
import { cors } from 'hono/cors'
import authRoutes from './routes/auth'
import productRoutes from './routes/product'
import cartRoutes from './routes/cart'
import orderRoutes from './routes/order'
import reviewsRoutes from './routes/review'
import paymentRoute from './routes/payments'


const app = new Hono<{
  Bindings : {  // specifying the type of env variable
    DATABASE_URL : string,
    JWT_SECRET : string
  }
}>()

app.use(
  '*',
  cors({
    origin: (origin) => {
      const allowedOrigins = [
        'http://127.0.0.1:5173',
        'http://localhost:5173',
        'https://sabka-bazaar-official.vercel.app',
      ]
      return allowedOrigins.includes(origin ?? '') ? origin : ''
    },
    credentials: true,
  })
)


app.route("/",authRoutes);
app.route("/",cartRoutes);
app.route("/",productRoutes);
app.route("/",orderRoutes);
app.route("/",reviewsRoutes);
app.route("/",paymentRoute);

export default app
