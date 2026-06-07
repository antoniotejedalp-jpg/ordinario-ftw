document.addEventListener('DOMContentLoaded', () => {

    const btnHamburguesa = document.getElementById('btn-hamburguesa');
    const menuEnlaces = document.getElementById('menu-enlaces');

    if (btnHamburguesa && menuEnlaces) {
        btnHamburguesa.addEventListener('click', () => {
            menuEnlaces.classList.toggle('oculto');
        });
    }

    const contenedorTabla = document.getElementById('tabla-dinamica-mods');
    const buscador = document.getElementById('buscador-mods');
    
    if (contenedorTabla) { 
        fetch('datos.xml')
        .then(respuesta => respuesta.text())
        .then(str => new window.DOMParser().parseFromString(str, "text/xml"))
        .then(data => {
            const mods = data.getElementsByTagName('mod');
            const modsArray = Array.from(mods).map(mod => ({
                nombre: mod.getElementsByTagName('nombre')[0].textContent,
                categoria: mod.getElementsByTagName('categoria')[0].textContent,
                dificultad: mod.getElementsByTagName('dificultad')[0].textContent,
            }));
            
            const renderizarTabla = (datos) => {
                if(datos.length === 0) {
                    contenedorTabla.innerHTML = '<p>No se encontraron mods que coincidan con tu búsqueda.</p>';
                    return;
                }
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
            renderizarTabla(modsArray);
            
            if (buscador) {
                buscador.addEventListener('input', (e) => {
                    const textoBusqueda = e.target.value.toLowerCase();
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

    const formulario = document.querySelector('form');

    if (formulario) {
        formulario.addEventListener('submit', (evento) => {
            evento.preventDefault();

            const userIngresado = document.getElementById('nombre').value;
            const passIngresado = document.getElementById('password').value;

            fetch('datos.xml')
                .then(respuesta => respuesta.text())
                .then(str => new window.DOMParser().parseFromString(str, "text/xml"))
                .then(data => {
                    const usuariosXML = data.getElementsByTagName('usuario');
                    let credencialesValidas = false;

                    for (let i = 0; i < usuariosXML.length; i++) {
                        let nick = usuariosXML[i].getElementsByTagName('nickname')[0].textContent;
                        let pass = usuariosXML[i].getElementsByTagName('password')[0].textContent;

                        if (nick === userIngresado && pass === passIngresado) {
                            credencialesValidas = true;
                            break;
                        }
                    }

                    if (credencialesValidas) {
                        alert(`¡Acceso validado! Bienvenido a la base de datos de la Wiki, ${userIngresado}. Tu mensaje será enviado con prioridad.`);
                        formulario.reset();
                    } else {
                        alert('Error: Usuario o Clave de Seguridad incorrectos. Asegúrate de estar registrado en XML.');
                    }
                })
                .catch(error => console.error('Error en la validación XML:', error));
        });
    }
});