import React from 'react';

const PrivacyPolicy: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto my-5 first-letter:px-4 sm:px-6 lg:px-8 py-10 text-whit px-4">
      <h1 className="text-3xl font-bold text-white mb-6">Política de Privacidad</h1>
      
      <section className="mb-6">
        <h2 className="text-2xl font-semibold  mb-4">Introducción</h2>
        <p className="text-gray-200">
          En nuestra plataforma, valoramos tu privacidad y estamos comprometidos a proteger tus datos personales. Esta Política de Privacidad describe cómo recopilamos, usamos y protegemos tu información.
        </p>
      </section>

      <section className="mb-6">
        <h2 className="text-2xl font-semibold   mb-4">¿Qué datos recopilamos?</h2>
        <ul className="list-disc list-inside text-gray-200 space-y-2">
          <li>Información que proporcionas: nombre, correo electrónico, datos de pago.</li>
          <li>Información automática: cookies, dirección IP, datos de uso del sitio.</li>
        </ul>
      </section>

      <section className="mb-6">
        <h2 className="text-2xl font-semibold   mb-4">Cómo usamos tus datos</h2>
        <ul className="list-disc list-inside text-gray-200 space-y-2">
          <li>Para conectar a estudiantes y profesores y gestionar las reservas de clases.</li>
          <li>Para personalizar tu experiencia en la plataforma.</li>
          <li>Para enviar notificaciones importantes sobre tus clases.</li>
        </ul>
      </section>

      <section className="mb-6">
        <h2 className="text-2xl font-semibold   mb-4">Compartición de datos</h2>
        <p className="text-gray-200">
          Nunca compartimos tus datos con terceros sin tu consentimiento, salvo cuando sea necesario para procesar pagos o cumplir con requerimientos legales.
        </p>
      </section>

      <section className="mb-6">
        <h2 className="text-2xl font-semibold   mb-4">Seguridad de los datos</h2>
        <p className="text-gray-200">
          Implementamos medidas técnicas y organizativas para proteger tus datos, incluyendo cifrado y acceso restringido.
        </p>
      </section>

      <section className="mb-6">
        <h2 className="text-2xl font-semibold   mb-4">Tus derechos</h2>
        <ul className="list-disc list-inside text-gray-200 space-y-2">
          <li>Acceso, modificación o eliminación de tus datos.</li>
          <li>Retirar tu consentimiento en cualquier momento.</li>
        </ul>
        <p className="text-gray-200 mt-2">
          Para ejercer estos derechos, contáctanos a través de nuestro correo: <a href="mailto:soporte@tuplataforma.com" className="  underline">soporte@tuplataforma.com</a>.
        </p>
      </section>

      <section className="mb-6">
        <h2 className="text-2xl font-semibold   mb-4">Cookies</h2>
        <p className="text-gray-200">
          Usamos cookies para mejorar tu experiencia en nuestra plataforma. Puedes deshabilitar las cookies desde la configuración de tu navegador.
        </p>
      </section>

      <section>
        <h2 className="text-2xl font-semibold   mb-4">Contacto</h2>
        <p className="text-gray-200">
          Si tienes preguntas o dudas sobre esta Política de Privacidad, contáctanos en: <a href="mailto:soporte@tuplataforma.com" className="  underline">soporte@tuplataforma.com</a>.
        </p>
      </section>
    </div>
  );
};

export default PrivacyPolicy;
