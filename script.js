/**
 * Evento que espera que el DOM este cargado antes de ejecutar la logica
 */
document.addEventListener('DOMContentLoaded', () => {

    const btnHamburguesa = document.getElementById('btn-hamburguesa');
    const menuEnlaces = document.getElementById('menu-enlaces');

    // La funcionalidad de el menu de hamburguesa
    if (btnHamburguesa && menuEnlaces) {
        btnHamburguesa.addEventListener('click', () => {
            console.log("¡Hiciste clic en el menú Navegación!"); 
            // Es el que altera la clase para oculto o mostrar
            if (menuEnlaces.classList.contains('oculto')) {
                menuEnlaces.classList.remove('oculto');
                console.log("El menú ahora se MUESTRA");
            } else {
                menuEnlaces.classList.add('oculto');
                console.log("El menú ahora se ESCONDE");
            }
        });
    }

    // logica para cargar fatos y renderizar la tabla
    const contenedorTabla = document.getElementById('tabla-dinamica-mods');
    const buscador = document.getElementById('buscador-mods');
    
    if (contenedorTabla) { 
        // Recupera datos desde el archivo XML
        fetch('datos.xml')
        .then(respuesta => respuesta.text())
        .then(str => new window.DOMParser().parseFromString(str, "text/xml"))
        .then(data => {
            const mods = data.getElementsByTagName('mod');
            // Mapeo de los nodos XML a un arreglo de objetos java
            const modsArray = Array.from(mods).map(mod => ({
                nombre: mod.getElementsByTagName('nombre')[0].textContent,
                categoria: mod.getElementsByTagName('categoria')[0].textContent,
                dificultad: mod.getElementsByTagName('dificultad')[0].textContent,
            }));
            
            /**
             * Función de renderizar la tabla HTML dinamicamente
             * @param {Array} datos  Arreglo de objetos con la informacion de los mods
             */
            const renderizarTabla = (datos) => {
                if(datos.length === 0) {
                    contenedorTabla.innerHTML = '<p>No se encontraron mods que coincidan con tu búsqueda.</p>';
                    return;
                }
                // Creación de las filas utilizando plantillas literales
                let filas = datos.map(mod => `
                    <tr>
                        <td><strong>${mod.nombre}</strong></td>
                        <td>${mod.categoria}</td>
                        <td>${mod.dificultad}</td>
                    </tr>
                `).join('');
                contenedorTabla.innerHTML = `
                    <table>
                        <thead>
                            <tr>
                                <th>Nombre del Mod</th>
                                <th>Categoría</th>
                                <th>Dificultad</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${filas}
                        </tbody>
                    </table>
                `;
            };

            // Renderizado inicial con todos los mods
            renderizarTabla(modsArray);
            
            // logica de filtrado dinamico
            if (buscador) {
                buscador.addEventListener('input', (e) => {
                    const textoBusqueda = e.target.value.toLowerCase();
                    // filtrar por coincidencia en nombre o categoria
                    const filtrados = modsArray.filter(mod =>
                        mod.nombre.toLowerCase().includes(textoBusqueda) ||
                        mod.categoria.toLowerCase().includes(textoBusqueda)
                    );
                    renderizarTabla(filtrados);
                });
            }                                                
        })
        .catch(error => console.error('Error al cargar el archivo XML:', error));
    }

    // logica de validacion de formilario contra XML
    const formContacto = document.querySelector('form:not(#form-login)');
    const formLogin = document.getElementById('form-login');

    /**
     * Función auxiliar para verificar credenciales en el archivo XML
     */
    const validarUsuarioEnXML = (usuario, password, callbackExito) => {
        fetch('datos.xml')
            .then(respuesta => respuesta.text())
            .then(str => new window.DOMParser().parseFromString(str, "text/xml"))
            .then(data => {
                const usuariosXML = data.getElementsByTagName('usuario');
                let credencialesValidas = false;

                for (let i = 0; i < usuariosXML.length; i++) {
                    let nick = usuariosXML[i].getElementsByTagName('nickname')[0].textContent;
                    let pass = usuariosXML[i].getElementsByTagName('password')[0].textContent;

                    if (nick === usuario && pass === password) {
                        credencialesValidas = true;
                        break;
                    }
                }

                if (credencialesValidas) {
                    callbackExito();
                } else {
                    alert('Error: Usuario o Clave de Seguridad incorrectos. Asegúrate de estar registrado en el archivo XML.');
                }
            })
            .catch(error => console.error('Error en la validación XML:', error));
    };

    // Validación para la página dedicada de Login
    if (formLogin) {
        formLogin.addEventListener('submit', (evento) => {
            evento.preventDefault();
            const userIngresado = document.getElementById('login-nombre').value;
            const passIngresado = document.getElementById('login-password').value;

            validarUsuarioEnXML(userIngresado, passIngresado, () => {
                alert(`¡Inicio de sesión correcto! Bienvenido ${userIngresado}. Has sido validado exitosamente mediante el esquema XML.`);
                formLogin.reset();
            });
        });
    }

    // Validación por si usan el formulario de Contacto tradicional
    if (formContacto) {
        formContacto.addEventListener('submit', (evento) => {
            evento.preventDefault();
            const userIngresado = document.getElementById('nombre').value;
            const passIngresado = document.getElementById('password').value;

            validarUsuarioEnXML(userIngresado, passIngresado, () => {
                alert(`¡Mensaje enviado con prioridad! El usuario '${userIngresado}' ha sido autenticado mediante XML.`);
                formContacto.reset();
            });
        });
    }
});