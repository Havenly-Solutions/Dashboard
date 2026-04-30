import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Cookie Policy | Havenly Solutions',
  description: 'Cookie Policy for Havenly Solutions (Pty) Ltd - Learn how we use cookies and similar technologies on our website.',
}

export default function CookiePolicyPage() {
  return (
    <>
      <style jsx global>{`
        [data-custom-class='body'], [data-custom-class='body'] * {
          background: transparent !important;
        }
        [data-custom-class='title'], [data-custom-class='title'] * {
          font-family: Arial !important;
          font-size: 26px !important;
          color: #000000 !important;
        }
        [data-custom-class='subtitle'], [data-custom-class='subtitle'] * {
          font-family: Arial !important;
          color: #595959 !important;
          font-size: 14px !important;
        }
        [data-custom-class='heading_1'], [data-custom-class='heading_1'] * {
          font-family: Arial !important;
          font-size: 19px !important;
          color: #000000 !important;
        }
        [data-custom-class='heading_2'], [data-custom-class='heading_2'] * {
          font-family: Arial !important;
          font-size: 17px !important;
          color: #000000 !important;
        }
        [data-custom-class='body_text'], [data-custom-class='body_text'] * {
          color: #595959 !important;
          font-size: 14px !important;
          font-family: Arial !important;
        }
        [data-custom-class='link'], [data-custom-class='link'] * {
          color: #3030F1 !important;
          font-size: 14px !important;
          font-family: Arial !important;
          word-break: break-word !important;
        }
      `}</style>

      <div style={{ 
        maxWidth: '900px', 
        margin: '0 auto', 
        padding: '40px 20px', 
        fontFamily: 'Arial, sans-serif',
        color: '#595959',
        lineHeight: '1.6'
      }}>
        {/* Logo */}
        <div style={{ 
          display: 'block', 
          margin: '0 auto 3.125rem', 
          width: '11.125rem', 
          height: '2.375rem', 
          background: 'url(data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxNzgiIGhlaWdodD0iMzgiIHZpZXdCb3g9IjAgMCAxNzggMzgiPgogICAgPGcgZmlsbD0ibm9uZSIgZmlsbC1ydWxlPSJldmVub2RkIj4KICAgICAgICA8cGF0aCBmaWxsPSIjRDFEMUQxIiBkPSJNNC4yODMgMjQuMTA3Yy0uNzA1IDAtMS4yNTgtLjI1Ni0xLjY2LS43NjhoLS4wODVjLjA1Ny41MDIuMDg2Ljc5Mi4wODYuODd2Mi40MzRILjk4NXYtOC42NDhoMS4zMzJsLjIzMS43NzloLjA3NmMuMzgzLS41OTQuOTUtLjg5MiAxLjcwMi0uODkyLjcxIDAgMS4yNjQuMjc0IDEuNjY1LjgyMi40MDEuNTQ4LjYwMiAxLjMwOS42MDIgMi4yODMgMCAuNjQtLjA5NCAxLjE5OC0uMjgyIDEuNjctLjE4OC40NzMtLjQ1Ni44MzMtLjgwMyAxLjA4LS4zNDcuMjQ3LS43NTYuMzctMS4yMjUuMzd6TTMuOCAxOS4xOTNjLS40MDUgMC0uNy4xMjQtLjg4Ni4zNzMtLjE4Ny4yNDktLjI4My42Ni0uMjkgMS4yMzN2LjE3N2MwIC42NDUuMDk1IDEuMTA3LjI4NyAxLjM4Ni4xOTIuMjguNDk1LjQxOS45MS40MTkuNzM0IDAgMS4xMDEtLjYwNSAxLjEwMS0xLjgxNiAwLS41OS0uMDktMS4wMzQtLjI3LTEuMzI5LS4xODItLjI5NS0uNDY1LS40NDMtLjg1Mi0uNDQzem01LjU3IDEuNzk0YzAgLjU5NC4wOTggMS4wNDQuMjkzIDEuMzQ4LjE5Ni4zMDQuNTEzLjQ1Ny45NTQuNDU3LjQzNyAwIC43NS0uMTUyLjk0Mi0uNDU0LjE5Mi0uMzAzLjI4OC0uNzUzLjI4OC0xLjM1MSAwLS41OTUtLjA5Ny0xLjA0LS4yOS0xLjMzOC0uMTk0LS4yOTctLjUxLS40NDUtLjk1LS40NDUtLjQzOCAwLS43NS4xNDctLjk0Ni40NDNsLS4xOTQuMjk1LS4yOS43NDItLjI5IDEuMzR6bTQuMTUzIDBjMCAuOTc3LS4yNTggMS43NDItLjc3NCAyLjI5My0uNTE1LjU1Mi0xLjIzMy44MjctMi4xNTQuODI3LS41NzYgMC0xLjA4NS0uMTI2LTEuNTI1LS4zNzhhMi41MiAyLjUyIDAgMCAxLTEuMDE1LTEuMDg4Yy0uMjM3LS40NzMtLjM1NS0xLjAyNC0uMzU1LTEuNjU0IDAtLjk4MS4yNTYtMS43NDQuNzY4LTIuMjg4LjUxMi0uNTQ1IDEuMjMyLS44MTcgMi4xNi0uODE3LjU3NiAwIDEuMDg1LjEyNiAxLjUyNS4zNzYuNDQuMjUxLjc3OS42MSAxLjAxNSAxLjA4LjIzNi40NjkuMzU1IDEuMDE5LjM1NSAxLjY0OXpNMTkuNzEgMjRsLS40NjItMi4xLS42MjMtMi42NTNoLS4wMzdMMTcuNDkzIDI0SDE1LjczbC0xLjcwOC02LjAwNWgxLjYzM2wuNjkzIDIuNjU5Yy4xMS40NzYuMjI0IDEuMTMzLjMzOCAxLjk3MWguMDMyYy4wMTUtLjI3Mi4wNzctLjcwNC4xODgtMS4yOTRsLjA4Ni0uNDU3Ljc0Mi0yLjg3OWgxLjgwNGwuNzA0IDIuODc5Yy4wMTQuMDc5LjAzNy4xOTUuMDY3LjM1YTIwLjk5OCAyMC45OTggMCAwIDEgLjE2NyAxLjAwMmMuMDIzLjE2NS4wMzYuMjk5LjA0LjM5OWguMDMyYy4wMzItLjI1OC4wOS0uNjExLjE3Mi0xLjA2LjA4Mi0uNDUuMTQxLS43NTQuMTc3LS45MTFsLjcyLTIuNjU5aDEuNjA2TDIxLjQ5NCAyNGgtMS43ODN6bTcuMDg2LTQuOTUyYy0uMzQ4IDAtLjYyLjExLS44MTcuMzMtLjE5Ny4yMi0uMzEuNTMzLS4zMzguOTM3aDIuMjk5Yy0uMDA4LS40MDQtLjExMy0uNzE3LS4zMTctLjkzNy0uMjA0LS4yMi0uNDgtLjMzLS44MjctLjMzem0uMjMgNS4wNmMtLjk2NiAwLTEuNzIyLS4yNjctMi4yNjYtLjgtLjU0NC0uNTM0LS44MTYtMS4yOS0uODE2LTIuMjY3IDAtMS4wMDcuMjUxLTEuNzg1Ljc1NC0yLjMzNC41MDMtLjU1IDEuMTk5LS44MjUgMi4wODctLjgyNS44NDggMCAxLjUxLjI0MiAxLjk4Mi43MjUuNDcyLjQ4NC43MDkgMS4xNTIuNzA5IDIuMDA0di43OTVoLTMuODczYy4wMTguNDY1LjE1Ni44MjkuNDE0IDEuMDkuMjU4LjI2MS42Mi4zOTIgMS4wODUuMzkyLjM2MSAwIC43MDMtLjAzNyAxLjAyNi0uMTEzYTUuMTMzIDUuMTMzIDAgMCAwIDEuMDEtLjM2djEuMjY4Yy0uMjg3LjE0My0uNTkzLjI1LS45Mi4zMmE1Ljc5IDUuNzkgMCAwIDEtMS4xOTEuMTA0em03LjI1My02LjIyNmMuMjIyIDAgLjQwNi4wMTYuNTUzLjA0OWwtLjEyNCAxLjUzNmExLjg3NyAxLjg3NyAwIDAgMC0uNDgzLS4wNTRjLS41MjMgMC0uOTMuMTM0LTEuMjIyLjQwMy0uMjkyLjI2OC0uNDM4LjY0NC0uNDM4IDEuMTI4VjI0aC0xLjYzOHYtNi4wMDA1aDEuMjRsLjI0MiAxLjAxaC4wOGMuMTg3LS4zMzcuNDM5LS42MDguNzU2LS44MTRBMUEuODYgQTEuODYgMCAwIDEgMS4wMzQtLjMwOXptNC4wMjkgMS4xNjZjLS4zNDcgMC0uNjIuMTEtLjgxNy4zMy0uMTk3LjIyLS4zMS41MzMtLjMzOC45MzdoMi4yOTljLS4wMDctLjQwNC0uMTEzLS43MTctLjMxNy0uOTM3LS4yMDQtLjIyLS40OC0uMzMtLjgyNy0uMzN6bS4yMyA1LjA2Yy0uOTY2IDAtMS43MjItLjI2Ny0yLjI2Ni0uOC0uNTQ0LS41MzQtLjgxNi0xLjI5LS44MTYtMi4yNjcgMC0xLjAwNy4yNTEtMS43ODUuNzU0LTIuMzM0LjUwNC0uNTUgMS4yLS44MjUgMi4wODctLjgyNS44NDkgMCAxLjUxLjI0MiAxLjk4Mi43MjUuNDczLjQ4NC43MDkgMS4xNTIuNzA5IDIuMDA0di43OTVoLTMuODczYy4wMTguNDY1LjE1Ni44MjkuNDE0IDEuMDkuMjU4LjI2MS42Mi4zOTIgMS4wODUuMzkyLjM2MiAwIC43MDQtLjAzNyAxLjAyNi0uMTEzYTUuMTMzIDUuMTMzIDAgMCAwIDEuMDEtLjM2djEuMjY4Yy0uMjg3LjE0My0uNTkzLjI1LS45MTkuMzJhNS43OSA1Ljc5IDAgMCAxLTEuMTkyLjEwNHptNS44MDMgMGMtLjcwNiAwLTEuMjYtLjI3NS0xLjY2My0uODIyLS40MDMtLjU0OC0uNjA0LTEuMzA3LS42MDQtMi4yNzggMC0uOTg0LjIwNS0xLjc1Mi42MTUtMi4zMDEuNDEtLjU1Ljk3NS0uODI1IDEuNjk1LS44MjUuNzU1IDAgMS4zMzIuMjk0IDEuNzI5Ljg4MWguMDU0YTYuNjk3IDYuNjk3IDAgMCAxLS4xMjQtMS4xOTh2LTEuOTIyaDEuNjQ0VjI0SDQ2LjQzbC0uMzE3LS43NzloLS4wN2MtLjM3Mi41OTEtLjk0Ljg4Ni0xLjcwMi44ODZ6bS41NzQtMS4zMDZjLjQyIDAgLjcyNi0uMTIxLjkyMS0uMzY1LjE5Ni0uMjQzLjMwMi0uNjU3LjMyLTEuMjR2LS4xNzhjMC0uNjQ0LS4xLTEuMTA2LS4yOTgtMS4zODYtLjE5OS0uMjc5LS41MjItLjQxOS0uOTctLjQxOWEuOTYyLjk2MiAwIDAgMC0uODUuNDY1Yy0uMjAzLjMxLS4zMDQuNzYtLjMwNCAxLjM1IDAgLjU5Mi4xMDIgMS4wMzUuMzA2IDEuMzMuMjA0LjI5Ni40OTYuNDQzLjg3NS40NDN6bTEwLjkyMi00LjkyYy43MDkgMCAxLjI2NC4yNzcgMS42NjUuODMuNC41NTMuNjAxIDEuMzEyLjYwMSAyLjI3NSAwIC45OTItLjIwNiAxLjc2LS42MiAyLjMwNC0uNDE0LjU0NC0uOTc3LjgxNi0xLjY5LjgxNi0uNzA1IDAtMS4yNTgtLjI1Ni0xLjY1OS0uNzY4aC0uMTEzbC0uMjc0LjY2MWgtMS4yNTF2LTguMzU3aDEuNjM4djEuOTQ0YzAgLjI0Ny0uMDIxLjY0My0uMDY0IDEuMTg3aC4wNjRjLjM4My0uNTk0Ljk1LS44OTIgMS43MDMtLjg5MnptLS41MjcgMS4zMWMtLjQwNCAwLS43LjEyNS0uODg2LjM3NC0uMTg2LjI0OS0uMjgzLjY2LS4yOSAxLjIzM3YuMTc3YzAgLjY0NS4wOTYgMS4xMDcuMjg3IDEuMzg2LjE5Mi4yOC40OTUuNDE5LjkxLjQxOS4zMzcgMCAuNjA1LS4xNTUuODA0LS40NjUuMTk5LS4zMS4yOTgtLjc2LjI5OC0xLjM1IDAtLjU5MS0uMS0xLjAzNS0uMy0xLjMzYS45NDMuOTQzIDAgMCAwLS44MjMtLjQ0M3ptMy4xODYtMS4xOTdoMS43OTRsMS4xMzQgMy4zNzljLjA5Ni4yOTMuMTYzLjY0LjE5OCAxLjA0MmguMDMzYy4wMzktLjM3LjExNi0uNzE3LjIzLTEuMDQybDEuMTEyLTMuMzc5aDEuNzU3bC0yLjU0IDYuNzczYy0uMjM0LjYyNy0uNTY2IDEuMDk2LS45OTcgMS40MDctLjQzMi4zMTItLjkzNi40NjgtMS41MTIuNDY4LS4yODMgMC0uNTYtLjAzLS44MzMtLjA5MnYtMS4zYTIuOCAyLjggMCAwIDAgLjY0NS4wN2MuMjkgMCAuNTQzLS4wODguNzYtLjI2Ni4yMTctLjE3Ny4zODYtLjQ0NC41MDgtLjgwM2wuMDk2LS4yOTUtMi4zODUtNS45NjJ6Ii8+CiAgICAgICAgPGcgdHJhbnNmb3JtPSJ0cmFuc2xhdGUoNzMpIj4KICAgICAgICAgICAgPGNpcmNsZSBjeD0iMTkiIGN5PSIxOSIgcj0iMTkiIGZpbGw9IiNFMEUwRTAiLz4KICAgICAgICAgICAgPHBhdGggZmlsbD0iI0ZGRiIgZD0iTTIyLjQ3NCAxNS40NDNoNS4xNjJMMTIuNDM2IDMwLjRWMTAuMzYzaDE1LjJsLTUuMTYyIDUuMDh6Ii8+CiAgICAgICAgPC9nPgogICAgICAgIDxwYXRoIGZpbGw9IiNEMkQyRDIiIGQ9Ik0xMjEuNTQ0IDE0LjU2di0xLjcyOGg4LjI3MnYxLjcyOGgtMy4wMjRWMjRoLTIuMjR2LTkuNDRoLTMuMDA4em0xMy43NDQgOS41NjhjLTEuMjkgMC0yLjM0MS0uNDE5LTMuMTUyLTEuMjU2LS84MS0uODM3LTEuMjE2LTEuOTQ0LTEuMjE2LTMuMzJzLjQwOC0yLjQ3NyAxLjIyNC0zLjMwNGMuODE2LS44MjcgMS44NzItMS4yNCAzLjE2OC0xLjI0czIuMzYuNDAzIDMuMTkyIDEuMjA4Yy44MzIuODA1IDEuMjQ4IDEuODggMS4yNDggMy4yMjQgMCAuMzEtLjAyMS41OTctLjA2NC44NjRoLTYuNDY0Yy4wNTMuNTc2LjI2NyAxLjA0LjY0IDEuMzkyLjM3My4zNTIuODQ4LjUyOCAxLjQyNC41MjguNzc5IDAgMS4zNTUtLjMyIDEuNzI4LS45NmgyLjQzMmEzLjg5MSAzLjg5MSAwIDAgMS0xLjQ4OCAyLjA2NGMtLjczNi41MzMtMS42MjcuOC0yLjY3Mi44em0xLjQ4LTYuNjg4Yy0uNC0uMzUyLS44ODMtLjUyOC0xLjQ0OC0uNTI4cy0xLjAzNy4xNzYtMS40MTYuNTI4Yy0uMzc5LjM1Mi0uNjA1LjgyMS0uNjggMS40MDhoNC4xOTJjLS4wMzItLjU4Ny0uMjQ4LTEuMDU2LS42NDgtMS40MDh6bTcuMDE2LTIuMzA0djEuNTY4Yy41OTctMS4xMyAxLjQ2MS0xLjY5NiAyLjU5Mi0xLjY5NnYyLjMwNGgtLjU2Yy0uNjcyIDAtMS4xNzkuMTY4LTEuNTIuNTA0LS4zNDEuMzM2LS41MTIuOTE1LS41MTIgMS43MzZWMjRoLTIuMjU2di04Ljg2NGgyLjI1NnptNi40NDggMHYxLjMyOGMuNTY1LS45NyAxLjQ4My0xLjQ1NiAyLjc1Mi0xLjQ1Ni42NzIgMCAxLjI3Mi4xNTUgMS44LjQ2NC41MjguMzEuOTM2Ljc1MiAxLjIyNCAxLjMyOC4zMS0uNTU1LjczMy0uOTkyIDEuMjcyLTEuMzEyYTMuNDg4IDMuNDg4IDAgMCAxIDEuODE2LS40OGMxLjA1NiAwIDEuOTA3LjMzIDIuNTUyLjk5Mi42NDUuNjYxLjk2OCAxLjU5Ljk2OCAyLjc4NFYyNGgtMi4yNHYtNC44OTZjMC0uNjk3LS4xNzYtMS4yMjQtLjUyOC0xLjU5Mi0uMzUyLS4zNjgtLjgzMi0uNTUyLTEuNDQtLjU1MnMtMS4wOS4xODQtMS40NDguNTUyYy0uMzU3LjM2OC0uNTM2Ljg5OS0uNTM2IDEuNTkyVjI0aC0yLjI0di00Ljg5NmMwLS42OTMtLjE3Ni0xLjIyNC0uNTI4LTEuNTkyLS4zNTItLjM2OC0uODMyLS41NTItMS40NC0uNTUycy0xLjA5LjE4NC0xLjQ0OC41NTJjLS4zNTcuMzY4LS41MzYuODk5LS41MzYgMS41OTJWMjRoLTIuMjU2di04Ljg2NGgyLjI1NnpNMTY0LjkzNiAyNFYxMi4xNmgyLjI1NlYyNGgtMi4yNTZ6bTcuMDQtLjE2bC0zLjQ3Mi04LjcwNGgyLjUyOGwyLjI1NiA2LjMwNCAyLjM4NC02LjMwNGgyLjM1MmwtNS41MzYgMTMuMDU2aC0yLjM1MmwxLjg0LTQuMzUyeiIvPgogICAgPC9nPgo8L3N2Zz4=) center no-repeat',
          backgroundSize: 'contain'
        }} />

        {/* Title */}
        <div style={{ textAlign: 'center', marginBottom: '30px' }}>
          <h1 style={{ fontSize: '26px', color: '#000000', margin: 0 }}>COOKIE POLICY</h1>
        </div>

        {/* Subtitle */}
        <div style={{ textAlign: 'center', marginBottom: '40px', color: '#7f7f7f' }}>
          <span style={{ fontSize: '15px' }}>Last updated April 30, 2026</span>
        </div>

        {/* Content */}
        <div data-custom-class="body">
          <div style={{ lineHeight: '1.5', marginBottom: '20px' }}>
            <span style={{ color: '#595959', fontSize: '15px' }}>
              This Cookie Policy explains how <strong>Havenly Solutions (Pty) Ltd</strong> (&quot;<strong>Company</strong>,&quot; &quot;<strong>we</strong>,&quot; &quot;<strong>us</strong>,&quot; and &quot;<strong>our</strong>&quot;) uses cookies and similar technologies to recognize you when you visit our website at{' '}
            </span>
            <a 
              href="https://www.havenly.solutions" 
              target="_blank" 
              rel="noopener noreferrer"
              style={{ color: '#003afa', fontSize: '15px' }}
            >
              https://www.havenly.solutions
            </a>
            <span style={{ color: '#595959', fontSize: '15px' }}>
              {' '}(&quot;<strong>Website</strong>&quot;). It explains what these technologies are and why we use them, as well as your rights to control our use of them.
            </span>
          </div>

          <div style={{ lineHeight: '1.5', marginBottom: '20px' }}>
            <span style={{ color: '#595959', fontSize: '15px' }}>
              In some cases we may use cookies to collect personal information, or that becomes personal information if we combine it with other information.
            </span>
          </div>

          {/* What are cookies? */}
          <h2 style={{ fontSize: '19px', color: '#000000', marginTop: '30px', marginBottom: '15px' }}>What are cookies?</h2>
          <div style={{ lineHeight: '1.5', marginBottom: '20px' }}>
            <span style={{ color: '#595959', fontSize: '15px' }}>
              Cookies are small data files that are placed on your computer or mobile device when you visit a website. Cookies are widely used by website owners in order to make their websites work, or to work more efficiently, as well as to provide reporting information.
            </span>
          </div>

          <div style={{ lineHeight: '1.5', marginBottom: '20px' }}>
            <span style={{ color: '#595959', fontSize: '15px' }}>
              Cookies set by the website owner (in this case, <strong>Havenly Solutions (Pty) Ltd</strong>) are called &quot;first-party cookies.&quot; Cookies set by parties other than the website owner are called &quot;third-party cookies.&quot; Third-party cookies enable third-party features or functionality to be provided on or through the website (e.g., advertising, interactive content, and analytics). The parties that set these third-party cookies can recognize your computer both when it visits the website in question and also when it visits certain other websites.
            </span>
          </div>

          {/* Why do we use cookies? */}
          <h2 style={{ fontSize: '19px', color: '#000000', marginTop: '30px', marginBottom: '15px' }}>Why do we use cookies?</h2>
          <div style={{ lineHeight: '1.5', marginBottom: '20px' }}>
            <span style={{ color: '#595959', fontSize: '15px' }}>
              We use first- and third-party cookies for several reasons. Some cookies are required for technical reasons in order for our Website to operate, and we refer to these as &quot;essential&quot; or &quot;strictly necessary&quot; cookies. Other cookies also enable us to track and target the interests of our users to enhance the experience on our Online Properties. Third parties serve cookies through our Website for advertising, analytics, and other purposes. This is described in more detail below.
            </span>
          </div>

          {/* How can I control cookies? */}
          <h2 style={{ fontSize: '19px', color: '#000000', marginTop: '30px', marginBottom: '15px' }}>How can I control cookies?</h2>
          <div style={{ lineHeight: '1.5', marginBottom: '20px' }}>
            <span style={{ color: '#595959', fontSize: '15px' }}>
              You have the right to decide whether to accept or reject cookies. You can exercise your cookie rights by setting your preferences in the Cookie Preference Center. The Cookie Preference Center allows you to select which categories of cookies you accept or reject. Essential cookies cannot be rejected as they are strictly necessary to provide you with services.
            </span>
          </div>

          <div style={{ lineHeight: '1.5', marginBottom: '20px' }}>
            <span style={{ color: '#595959', fontSize: '15px' }}>
              The Cookie Preference Center can be found in the notification banner and on our Website. If you choose to reject cookies, you may still use our Website though your access to some functionality and areas of our Website may be restricted. You may also set or amend your web browser controls to accept or refuse cookies.
            </span>
          </div>

          <div style={{ lineHeight: '1.5', marginBottom: '20px' }}>
            <span style={{ color: '#595959', fontSize: '15px' }}>
              The specific types of first- and third-party cookies served through our Website and the purposes they perform are described in the table below (please note that the specific cookies served may vary depending on the specific Online Properties you visit):
            </span>
          </div>

          {/* How can I control cookies on my browser? */}
          <h2 style={{ fontSize: '19px', color: '#000000', marginTop: '30px', marginBottom: '15px' }}>How can I control cookies on my browser?</h2>
          <div style={{ lineHeight: '1.5', marginBottom: '20px' }}>
            <span style={{ color: '#595959', fontSize: '15px' }}>
              As the means by which you can refuse cookies through your web browser controls vary from browser to browser, you should visit your browser&apos;s help menu for more information. The following is information about how to manage cookies on the most popular browsers:
            </span>
          </div>

          <ul style={{ listStyleType: 'square', paddingLeft: '20px', marginBottom: '20px' }}>
            <li style={{ lineHeight: '1.5', marginBottom: '10px' }}>
              <a 
                href="https://support.google.com/chrome/answer/95647" 
                target="_blank" 
                rel="noopener noreferrer"
                style={{ color: '#003afa', fontSize: '15px' }}
              >
                Chrome
              </a>
            </li>
            <li style={{ lineHeight: '1.5', marginBottom: '10px' }}>
              <a 
                href="https://support.microsoft.com/en-us/windows/delete-and-manage-cookies-168dab11-0753-043d-7c16-ede5947fc64d" 
                target="_blank" 
                rel="noopener noreferrer"
                style={{ color: '#003afa', fontSize: '15px' }}
              >
                Internet Explorer
              </a>
            </li>
            <li style={{ lineHeight: '1.5', marginBottom: '10px' }}>
              <a 
                href="https://support.mozilla.org/en-US/kb/enhanced-tracking-protection-firefox-desktop" 
                target="_blank" 
                rel="noopener noreferrer"
                style={{ color: '#003afa', fontSize: '15px' }}
              >
                Firefox
              </a>
            </li>
            <li style={{ lineHeight: '1.5', marginBottom: '10px' }}>
              <a 
                href="https://support.apple.com/en-ie/guide/safari/sfri11471/mac" 
                target="_blank" 
                rel="noopener noreferrer"
                style={{ color: '#003afa', fontSize: '15px' }}
              >
                Safari
              </a>
            </li>
            <li style={{ lineHeight: '1.5', marginBottom: '10px' }}>
              <a 
                href="https://support.microsoft.com/en-us/windows/microsoft-edge-browsing-data-and-privacy-bb8174ba-9d73-dcf2-9b4a-c582b4e640dd" 
                target="_blank" 
                rel="noopener noreferrer"
                style={{ color: '#003afa', fontSize: '15px' }}
              >
                Edge
              </a>
            </li>
            <li style={{ lineHeight: '1.5', marginBottom: '10px' }}>
              <a 
                href="https://help.opera.com/en/latest/web-preferences/" 
                target="_blank" 
                rel="noopener noreferrer"
                style={{ color: '#003afa', fontSize: '15px' }}
              >
                Opera
              </a>
            </li>
          </ul>

          <div style={{ lineHeight: '1.5', marginBottom: '20px' }}>
            <span style={{ color: '#595959', fontSize: '15px' }}>
              In addition, most advertising networks offer you a way to opt out of targeted advertising. If you would like to find out more information, please visit:
            </span>
          </div>

          <ul style={{ listStyleType: 'square', paddingLeft: '20px', marginBottom: '20px' }}>
            <li style={{ lineHeight: '1.5', marginBottom: '10px' }}>
              <a 
                href="http://www.aboutads.info/choices/" 
                target="_blank" 
                rel="noopener noreferrer"
                style={{ color: '#003afa', fontSize: '15px' }}
              >
                Digital Advertising Alliance
              </a>
            </li>
            <li style={{ lineHeight: '1.5', marginBottom: '10px' }}>
              <a 
                href="https://youradchoices.ca/" 
                target="_blank" 
                rel="noopener noreferrer"
                style={{ color: '#003afa', fontSize: '15px' }}
              >
                Digital Advertising Alliance of Canada
              </a>
            </li>
            <li style={{ lineHeight: '1.5', marginBottom: '10px' }}>
              <a 
                href="http://www.youronlinechoices.com/" 
                target="_blank" 
                rel="noopener noreferrer"
                style={{ color: '#003afa', fontSize: '15px' }}
              >
                European Interactive Digital Advertising Alliance
              </a>
            </li>
          </ul>

          {/* What about other tracking technologies? */}
          <h2 style={{ fontSize: '19px', color: '#000000', marginTop: '30px', marginBottom: '15px' }}>What about other tracking technologies, like web beacons?</h2>
          <div style={{ lineHeight: '1.5', marginBottom: '20px' }}>
            <span style={{ color: '#595959', fontSize: '15px' }}>
              Cookies are not the only way to recognize or track visitors to a website. We may use other, similar technologies from time to time, like web beacons (sometimes called &quot;tracking pixels&quot; or &quot;clear gifs&quot;). These are tiny graphics files that contain a unique identifier that enables us to recognize when someone has visited our Website or opened an email including them. This allows us, for example, to monitor the traffic patterns of users from one page within a website to another, to deliver or communicate with cookies, to understand whether you have come to the website from an online advertisement displayed on a third-party website, to improve site performance, and to measure the success of email marketing campaigns. In many instances, these technologies are reliant on cookies to function properly, and so declining cookies will impair their functioning.
            </span>
          </div>

          {/* Do you use Flash cookies? */}
          <h2 style={{ fontSize: '19px', color: '#000000', marginTop: '30px', marginBottom: '15px' }}>Do you use Flash cookies or Local Shared Objects?</h2>
          <div style={{ lineHeight: '1.5', marginBottom: '20px' }}>
            <span style={{ color: '#595959', fontSize: '15px' }}>
              Websites may also use so-called &quot;Flash Cookies&quot; (also known as Local Shared Objects or &quot;LSOs&quot;) to, among other things, collect and store information about your use of our services, fraud prevention, and for other site operations.
            </span>
          </div>

          <div style={{ lineHeight: '1.5', marginBottom: '20px' }}>
            <span style={{ color: '#595959', fontSize: '15px' }}>
              If you do not want Flash Cookies stored on your computer, you can adjust the settings of your Flash player to block Flash Cookies storage using the tools contained in the{' '}
            </span>
            <a 
              href="http://www.macromedia.com/support/documentation/en/flashplayer/help/settings_manager07.html" 
              target="_blank" 
              rel="noopener noreferrer"
              style={{ color: '#003afa', fontSize: '15px' }}
            >
              Website Storage Settings Panel
            </a>
            <span style={{ color: '#595959', fontSize: '15px' }}>. You can also control Flash Cookies by going to the{' '}</span>
            <a 
              href="http://www.macromedia.com/support/documentation/en/flashplayer/help/settings_manager03.html" 
              target="_blank" 
              rel="noopener noreferrer"
              style={{ color: '#003afa', fontSize: '15px' }}
            >
              Global Storage Settings Panel
            </a>
            <span style={{ color: '#595959', fontSize: '15px' }}>{' '}and following the instructions (which may include instructions that explain, for example, how to delete existing Flash Cookies (referred to &quot;information&quot; on the Macromedia site), how to prevent Flash LSOs from being placed on your computer without your being asked, and (for Flash Player 8 and later) how to block Flash Cookies that are not being delivered by the operator of the page you are on at the time).</span>
          </div>

          <div style={{ lineHeight: '1.5', marginBottom: '20px' }}>
            <span style={{ color: '#595959', fontSize: '15px' }}>
              Please note that setting the Flash Player to restrict or limit acceptance of Flash Cookies may reduce or impede the functionality of some Flash applications, including, potentially, Flash applications used in connection with our services or online content.
            </span>
          </div>

          {/* Do you serve targeted advertising? */}
          <h2 style={{ fontSize: '19px', color: '#000000', marginTop: '30px', marginBottom: '15px' }}>Do you serve targeted advertising?</h2>
          <div style={{ lineHeight: '1.5', marginBottom: '20px' }}>
            <span style={{ color: '#595959', fontSize: '15px' }}>
              Third parties may serve cookies on your computer or mobile device to serve advertising through our Website. These companies may use information about your visits to this and other websites in order to provide relevant advertisements about goods and services that you may be interested in. They may also employ technology that is used to measure the effectiveness of advertisements. They can accomplish this by using cookies or web beacons to collect information about your visits to this and other sites in order to provide relevant advertisements about goods and services of potential interest to you. The information collected through this process does not enable us or them to identify your name, contact details, or other details that directly identify you unless you choose to provide these.
            </span>
          </div>

          {/* How often will you update this Cookie Policy? */}
          <h2 style={{ fontSize: '19px', color: '#000000', marginTop: '30px', marginBottom: '15px' }}>How often will you update this Cookie Policy?</h2>
          <div style={{ lineHeight: '1.5', marginBottom: '20px' }}>
            <span style={{ color: '#595959', fontSize: '15px' }}>
              We may update this Cookie Policy from time to time in order to reflect, for example, changes to the cookies we use or for other operational, legal, or regulatory reasons. Please therefore revisit this Cookie Policy regularly to stay informed about our use of cookies and related technologies.
            </span>
          </div>

          <div style={{ lineHeight: '1.5', marginBottom: '20px' }}>
            <span style={{ color: '#595959', fontSize: '15px' }}>
              The date at the top of this Cookie Policy indicates when it was last updated.
            </span>
          </div>

          {/* Where can I get further information? */}
          <h2 style={{ fontSize: '19px', color: '#000000', marginTop: '30px', marginBottom: '15px' }}>Where can I get further information?</h2>
          <div style={{ lineHeight: '1.5', marginBottom: '20px' }}>
            <span style={{ color: '#595959', fontSize: '15px' }}>
              If you have any questions about our use of cookies or other technologies, please contact us at:
            </span>
          </div>

          <div style={{ lineHeight: '1.5', marginBottom: '10px' }}>
            <strong style={{ color: '#595959', fontSize: '15px' }}>Havenly Solutions (Pty) Ltd</strong>
          </div>
          <div style={{ lineHeight: '1.5', marginBottom: '10px' }}>
            <span style={{ color: '#595959', fontSize: '15px' }}>36A Benmore Road</span>
          </div>
          <div style={{ lineHeight: '1.5', marginBottom: '10px' }}>
            <span style={{ color: '#595959', fontSize: '15px' }}>Johannesburg, Gauteng, 2010</span>
          </div>
          <div style={{ lineHeight: '1.5', marginBottom: '10px' }}>
            <span style={{ color: '#595959', fontSize: '15px' }}>South Africa</span>
          </div>
          <div style={{ lineHeight: '1.5', marginBottom: '30px' }}>
            <span style={{ color: '#595959', fontSize: '15px' }}>Phone: 070 368 7327</span>
          </div>

          {/* Footer */}
          <div style={{ marginTop: '40px', paddingTop: '20px', borderTop: '1px solid #e0e0e0' }}>
            <p style={{ fontSize: '12px', color: '#7f7f7f', textAlign: 'center' }}>
              This Cookie Policy was created using Termly&apos;s{' '}
              <a 
                href="https://termly.io/products/cookie-consent-manager/" 
                target="_blank" 
                rel="noopener noreferrer"
                style={{ color: '#3030F1', fontSize: '12px' }}
              >
                Cookie Consent Manager
              </a>
            </p>
          </div>
        </div>
      </div>
    </>
  )
}