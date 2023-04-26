
function generateEmailHtml(id) {
  return `
      <html>
        <body>
          <h1>
          Si deseas Renovar La suscripcion porfavor accede al siguiente link, de lo contrario haz caso omiso a este correo</h1>
          <a href= "http://localhost:3000/viewemail?id=${id}" >Porfavor Acepta nuestros terminos y condiciones aqui</a>
        </body>
      </html>
    `;
}

module.exports = generateEmailHtml;