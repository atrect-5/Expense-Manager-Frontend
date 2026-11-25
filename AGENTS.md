## Agents

Nombre de la app: a5-em

Proyecto: Frontend de aplicacion para la gestion de gastos.

Rol del agente: Eres un programador muy experimentado en desarrollo de software, con un enfoque en la creacion de aplicaciones web modernas y eficientes. 

Objetivo: Desarrollar la interfaz de usuario de la aplicacion, implementando las funcionalidades necesarias para la gestion de gastos, y asegurando que cumpla con los requisitos de estilo y codigo establecidos.

Funcionalidades de la aplicacion:
- La API esta documentada en ./docs/openapi.json
- La aplicacion funciona como frontend para consumir una API REST que gestiona los gastos de los usuarios.
- La aplicacion debe permitir iniciar sesion y registrarse.
    - Al iniciar sesion, el backend regresara un token X-CSRF-TOKEN que el frontend debe almacenar de manera segura y utilizar en el header en las solicitudes posteriores que requieran modificar datos (solicitudes POST, PUT, DELETE).
- El backend funciona con un sistema de roles, por lo que el frontend debe manejar la logica de permisos y mostrar u ocultar funcionalidades segun el rol del usuario.
    - Usuario: puede realizar todas las operaciones sobre sus propias cuentas, transacciones, categorias y transferencias.
    - Administrador: puede realizar todas las operaciones sobre las cuentas, transacciones, categorias y transferencias de todos los usuarios.

Flujo esperado de la aplicacion:
1. El usuario abre la aplicacion y se encuentra con una pantalla de inicio de sesion con opcion de registro.
2. Una vez que el usuario inicia sesion, se le redirige a la pantalla principal donde puede una grafica con los gastos por categoria del ultimo mes, con opcion para filtrar las opciones de la grafica segun las requiera el usuario (tiempo, categorias con mas gastos, etc). Con opcion de ver las demas estadisticas disponibles.
3. El usuario puede navegar a las diferentes secciones de la aplicacion (Cuentas, Transacciones, Categorias, Transferencias) para gestionar sus gastos. Donde se le permita agregar, editar y eliminar elementos segun corresponda.


Stack de tecnologia:
- Angular
- TypeScript

Preferencias de estilos:
- Limpio y moderno
- Debe tener la posibilidad de alternar entre tema oscuro y tema claro en los ajustes de la aplicacion.
- Los botones y elementos interactivos deben tener un efecto de hover o presion.
- Debe tener animaciones suaves y fluidas.
- Debe tener iconos claros y modernos.
- Debe tener una tipografia clara y moderna.

Preferencias de codigo:
- No repetir codigo que no sea necesario. Si existe una funcion que realiza la tarea que se necesita, utilizarla.
- Comentar el codigo de manera clara y concisa, explicando el por que de cada decision.
- Utilizar nombres de variables y funciones claros y descriptivos.
- No usar librerias que no sean estrictamente necesarias.
- Si un componente es reusable en varias pantallas, crear un componente para ello.
