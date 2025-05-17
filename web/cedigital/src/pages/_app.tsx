import type { AppProps } from 'next/app'
import 'bootstrap/dist/css/bootstrap.min.css'
import '@fortawesome/fontawesome-free/css/all.min.css'
import '../styles/globals.css'
import '../styles/components/login.css'
import '../styles/components/admin.css'
import '../styles/components/professor.css'
import '../styles/components/student.css'


function MyApp({ Component, pageProps }: AppProps) {
  return <Component {...pageProps} />
}

export default MyApp
