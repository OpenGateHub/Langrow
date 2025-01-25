import React from 'react';

const TermsOfService: React.FC = () => {
  return (
    <div className="container mx-auto p-6 text-white">
      <h1 className="text-3xl font-bold mb-6 mt-5">Términos de Servicio</h1>

      <section className="mb-6">
        <h2 className="text-2xl font-semibold mb-4">Bienvenida</h2>
        <p>
          Bienvenido/a a nuestra plataforma, un espacio que conecta estudiantes y profesores de inglés para clases particulares. Al usar nuestros servicios, aceptas los términos y condiciones que se describen a continuación. Por favor, léelos detenidamente antes de utilizar la plataforma.
        </p>
      </section>

      <section className="mb-6">
        <h2 className="text-2xl font-semibold mb-4">1. Aceptación de los Términos</h2>
        <p>
          El acceso y uso de nuestra plataforma implica la aceptación de estos términos. Si no estás de acuerdo con alguna de las condiciones, por favor, no utilices nuestros servicios.
        </p>
      </section>

      <section className="mb-6">
        <h2 className="text-2xl font-semibold mb-4">2. Descripción del Servicio</h2>
        <ul className="list-disc pl-6">
          <li>Buscar profesores de inglés.</li>
          <li>Reservar clases individuales.</li>
          <li>Realizar pagos seguros.</li>
        </ul>
        <p>
          Los profesores, por su parte, pueden:
        </p>
        <ul className="list-disc pl-6">
          <li>Crear un perfil profesional.</li>
          <li>Ofrecer horarios disponibles.</li>
          <li>Recibir pagos por las clases impartidas.</li>
        </ul>
      </section>

      <section className="mb-6">
        <h2 className="text-2xl font-semibold mb-4">3. Responsabilidades de los Usuarios</h2>
        <h3 className="text-xl font-medium mb-2">Estudiantes:</h3>
        <ul className="list-disc pl-6">
          <li>Proveer información verídica y actualizada.</li>
          <li>Respetar los horarios y políticas de cancelación de los profesores.</li>
          <li>Realizar pagos a través de los métodos autorizados por la plataforma.</li>
        </ul>
        <h3 className="text-xl font-medium mb-2">Profesores:</h3>
        <ul className="list-disc pl-6">
          <li>Ofrecer información precisa en sus perfiles.</li>
          <li>Cumplir con las clases programadas.</li>
          <li>Respetar las políticas de la plataforma respecto a los pagos y cancelaciones.</li>
        </ul>
      </section>

      <section className="mb-6">
        <h2 className="text-2xl font-semibold mb-4">4. Reservas y Cancelaciones</h2>
        <p>
          <strong>Reservas:</strong> Los estudiantes pueden reservar clases según la disponibilidad indicada por los profesores.
        </p>
        <p>
          <strong>Cancelaciones:</strong> Cada profesor establece sus propias políticas de cancelación, que deben ser claramente comunicadas en su perfil. La plataforma no se responsabiliza por reembolsos que no cumplan estas políticas.
        </p>
      </section>

      <section className="mb-6">
        <h2 className="text-2xl font-semibold mb-4">5. Pagos</h2>
        <p>
          Los pagos se procesan a través de nuestra plataforma utilizando métodos seguros y confiables. Los profesores recibirán el pago correspondiente después de descontar la comisión acordada por el uso del servicio.
        </p>
      </section>

      <section className="mb-6">
        <h2 className="text-2xl font-semibold mb-4">6. Prohibiciones</h2>
        <ul className="list-disc pl-6">
          <li>Usar la plataforma para fines ilegales.</li>
          <li>Publicar información falsa o engañosa.</li>
          <li>Realizar pagos fuera de la plataforma.</li>
        </ul>
      </section>

      <section className="mb-6">
        <h2 className="text-2xl font-semibold mb-4">7. Limitación de Responsabilidad</h2>
        <p>
          La plataforma actúa únicamente como un intermediario entre estudiantes y profesores. No nos hacemos responsables de:
        </p>
        <ul className="list-disc pl-6">
          <li>Problemas relacionados con la calidad de las clases.</li>
          <li>Cancelaciones por parte de profesores o estudiantes.</li>
          <li>Disputas entre usuarios.</li>
        </ul>
      </section>

      <section className="mb-6">
        <h2 className="text-2xl font-semibold mb-4">8. Privacidad</h2>
        <p>
          El uso de la plataforma está sujeto a nuestra Política de Privacidad, que detalla cómo recopilamos, usamos y protegemos tu información personal.
        </p>
      </section>

      <section className="mb-6">
        <h2 className="text-2xl font-semibold mb-4">9. Modificaciones</h2>
        <p>
          Nos reservamos el derecho de modificar estos Términos de Servicio en cualquier momento. Te notificaremos sobre cambios importantes a través de la plataforma.
        </p>
      </section>

      <section className="mb-6">
        <h2 className="text-2xl font-semibold mb-4">10. Contacto</h2>
        <p>
          Si tienes preguntas o dudas sobre estos términos, puedes contactarnos en <a href="mailto:soporte@tuplataforma.com" className="text-blue-500 underline">soporte@tuplataforma.com</a> o a través de nuestra sección de ayuda.
        </p>
      </section>

      <p className="text-center text-sm mt-6">© {new Date().getFullYear()} Tu Plataforma. Todos los derechos reservados.</p>
    </div>
  );
};

export default TermsOfService;

