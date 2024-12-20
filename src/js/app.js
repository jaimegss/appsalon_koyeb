let paso = 1;
const pasoInicial = 1;
const pasoFinal = 3;

const cita = {
    id: '',
    nombre: '',
    fecha: '',
    hora: '',
    servicios: []
}

document.addEventListener('DOMContentLoaded', function() {
    iniciarApp();
});

function iniciarApp() {
    mostrarSeccion(); //Muestra y oculta las secciones
    tabs(); //Cambia la sección cuando se presionan lo tabs 
    botonesPaginador(); //Agrega o quita los botones del paginador
    paginaSiguiente();
    paginaAnterior();

    consultarAPI(); //Consulta la API en el BackEnd del PHP

    idCliente(); //
    nombreCliente(); //Añade el nombre del cliente al objeto de Cita
    seleccionarFecha(); //Añade la fecha de la cita en el objeto
    seleccionarHora(); //Añada la hora de la cita en el objeto

    mostrarResumen(); //Muestra el resumen de la cita
};

function mostrarSeccion() {
    //Ocultar la sección que tenga la clase de mostrar
    const seccionAnterior = document.querySelector('.mostrar');
    if(seccionAnterior) {
        seccionAnterior.classList.remove("mostrar");
    }

    //Seleccionar la sección con el paso
    const pasoSelector = `#paso-${paso}`;
    const seccion = document.querySelector(pasoSelector);
    seccion.classList.add("mostrar");

    //Quita la clase de actual al tab anterior
    const tabAnterior = document.querySelector('.actual');
    if(tabAnterior) {
        tabAnterior.classList.remove('actual');
    }
    //Resalta el tab actual
    const tab = document.querySelector(`[data-paso="${paso}"]`);
    tab.classList.add('actual');
};

function tabs() {
    const botones = document.querySelectorAll('.tabs button');
    botones.forEach( boton => {
        boton.addEventListener('click', function(e) {
            paso = parseInt(e.target.dataset.paso);
            mostrarSeccion();
            botonesPaginador();
        })
    })   
}

function botonesPaginador() {
    const paginaAnterior = document.querySelector('#anterior');
    const paginaSiguiente = document.querySelector('#siguiente');
    if(paso===1) {
        paginaAnterior.classList.add('ocultar');
        paginaSiguiente.classList.remove('ocultar');
    } else if(paso ===3) {
        paginaAnterior.classList.remove('ocultar');
        paginaSiguiente.classList.add('ocultar');
        mostrarResumen();
    } else {
        paginaAnterior.classList.remove('ocultar');
        paginaSiguiente.classList.remove('ocultar');
    };
    mostrarSeccion();
}

function paginaAnterior() {
    const paginaAnterior = document.querySelector('#anterior');
    paginaAnterior.addEventListener('click', function(){
        if (paso<=pasoInicial) return;
        paso--;
        botonesPaginador();
    });
}

function paginaSiguiente() {
    const paginaSiguiente = document.querySelector('#siguiente');
    paginaSiguiente.addEventListener('click', function(){
        if (paso>=pasoFinal) return;
        paso++;
        botonesPaginador();
    });
}

async function consultarAPI() {

    try {
        //const url = 'http://localhost:3000/api/servicios';
        // Podría sustituirse por la variable Location.origin
        //const url = `${Location.origin}/api/servicios`;
        // O dejar solo la parte final, si todo está en el mismo dominio
        const url = `/api/servicios`;
        const resultado = await fetch(url);
        const servicios = await resultado.json();
        mostrarServicios(servicios);
    } catch (error) {
        console.log(error);
    }
}

function mostrarServicios (servicios) {
    servicios.forEach( servicio => {
        const {id, nombre, precio} = servicio;

        const nombreServicio = document.createElement('P');
        nombreServicio.classList.add('nombre-servicio');
        nombreServicio.textContent = nombre;

        const precioServicio = document.createElement('P');
        precioServicio.classList.add('precio-servicio');
        precioServicio.textContent = `${precio} €`;

        const servicioDiv = document.createElement('DIV');
        servicioDiv.classList.add('servicio');
        servicioDiv.dataset.idServicio = id;
        servicioDiv.onclick = function() {
            seleccionarServicio(servicio);
        };
        servicioDiv.appendChild(nombreServicio);
        servicioDiv.appendChild(precioServicio);

        document.querySelector('#servicios').appendChild(servicioDiv);
    });
}

function seleccionarServicio(servicio) {
    const { id } = servicio;
    const { servicios } = cita;

    //IDentificar el elemento al que se le dio click
    const divServicio = document.querySelector(`[data-id-servicio="${id}"]`);
    //Comprobar si un servicio ya fue agregado
    if ( servicios.some( agregado => agregado.id === id ) ) {
        //Eliminarlo
        cita.servicios = servicios.filter( agregado => agregado.id !== id);
        divServicio.classList.remove('seleccionado');
    } else {
        //Agregarlo
        cita.servicios = [...servicios, servicio];
        divServicio.classList.add('seleccionado');
    };
}

function idCliente() {
    cita.id = document.querySelector('#id').value;
}

function nombreCliente() {
    cita.nombre = document.querySelector('#nombre').value;
}

function seleccionarFecha() {
    const inputFecha = document.querySelector('#fecha');
    inputFecha.addEventListener('input', function(e) {
        const dia = new Date(e.target.value).getUTCDay();
        if( [6,0].includes(dia) ) {
            e.target.value = '';
            mostrarAlerta('Fines de semana no permitidos','error','.formulario');
        } else {
            cita.fecha = e.target.value;
            mostrarAlerta('Fecha correcta','exito','.formulario');
        }
        });
}

function seleccionarHora() {
    const inputHora = document.querySelector('#hora');
    inputHora.addEventListener('input', function(e) {
        const horaCita = e.target.value;
        const hora = horaCita.split(':')[0];
        if(hora < 10 || hora > 18) {
            e.target.value = '';
            mostrarAlerta('Hora seleccionada no válida','error','.formulario');
        } else {
            cita.hora = inputHora.value;
        }
    });
}

function mostrarAlerta (mensaje, tipo, elemento, desaparece = true) {
    // Previene que se generen más de 1 alerta
    const alertaPrevia = document.querySelector('.alerta');
    if(alertaPrevia) {
        alertaPrevia.remove();
    };
    
    //Scripting para crear la alerta
    const alerta = document.createElement('DIV')
    alerta.textContent = mensaje;
    alerta.classList.add('alerta');
    alerta.classList.add(tipo);

    const referencia = document.querySelector(elemento);
    referencia.appendChild(alerta);

    if(desaparece) {
        //Eliminar la alerta
        setTimeout(() => {
            alerta.remove();
        },3000);
    }
}

function mostrarResumen() {
    const resumen = document.querySelector('.contenido-resumen');
console.log(resumen.firstChild);
    //Limpiar el contenido de Resumen
    while (resumen.firstChild) {
        resumen.removeChild(resumen.firstChild);
    }

    if(Object.values(cita).includes('') || cita.servicios.length === 0) {
        mostrarAlerta('Faltan datos del servicio, Fecha u Hora', 'error', '.contenido-resumen',false);
        
        return;
    }

    //Formatear el div de Resumen
    const { nombre , fecha, hora, servicios } = cita;

    //Heading para servicios en resumen
    const headingServicio = document.createElement('H3');
    headingServicio.textContent = 'Resumen de Servicios';
    resumen.appendChild(headingServicio);

    //Iterando y mostrando los servicio
    servicios.forEach(servicio => {
        const { id, precio, nombre } = servicio;
        const contenedorServicio = document.createElement('DIV');
        contenedorServicio.classList.add('contenedor-servicio');
        
        const textoServicio = document.createElement('P');
        textoServicio.textContent = nombre;

        const precioServicio = document.createElement('P');
        precioServicio.innerHTML = `<span>Precio Cita:</span> $${precio}`;

        contenedorServicio.appendChild(textoServicio);
        contenedorServicio.appendChild(precioServicio);

        resumen.appendChild(contenedorServicio);
    })

    //Heading para Cita en resumen
    const headingCita = document.createElement('H3');
    headingCita.textContent = 'Resumen de Cita';
    resumen.appendChild(headingCita);


    const nombreCliente = document.createElement('P');
    nombreCliente.innerHTML = `<span>Nombre:</span> ${nombre}`;

    //Formatear la fecha en español
    const fechaObj = new Date(fecha);
    const mes = fechaObj.getMonth();
    const dia = fechaObj.getDate(); 
    const year = fechaObj.getFullYear();

    const fechaUTC = new Date(Date.UTC(year,mes,dia));
    
    const opciones = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'};
    const fechaFormateada = fechaUTC.toLocaleDateString('es-ES', opciones);    
    
    const fechaCita = document.createElement('P');
    fechaCita.innerHTML = `<span>Fecha Cita:</span> ${fechaFormateada}`;

    const horaCita = document.createElement('P');
    horaCita.innerHTML = `<span>Hora Cita:</span> ${hora} Horas`;

    resumen.appendChild(nombreCliente);
    resumen.appendChild(fechaCita);
    resumen.appendChild(horaCita);

    //Botón para Crear una cita
    const botonReserva = document.createElement('BUTTON');
    botonReserva.classList.add('boton');
    botonReserva.textContent = 'Reserva Cita';
    botonReserva.onclick = reservarCita;

    resumen.appendChild(botonReserva);
}

async function reservarCita () {
    const { nombre , fecha, hora, servicios, id} = cita;

    const idServicios = servicios.map(servicio => servicio.id);
    //console.log(idServicios);

    const datos = new FormData();
    datos.append('fecha',fecha);
    datos.append('hora',hora);
    datos.append('usuarioId',id);
    datos.append('servicios',idServicios);

    //console.log([...datos]);

    try {
        //Petición hacia la api
        //const url = 'http://localhost:3000/api/citas';
        const url = '/api/citas';

        const respuesta = await fetch(url, {
            method: 'POST',
            body: datos
        });

        const resultado = await respuesta.json();
        if(resultado.resultado) {
            Swal.fire({
                icon: "success",
                title: "Cita Creada",
                text: "Tu cita fue creada correctamente.",
                //button: 'OK'
                confirmButtonText: "OK"
            }).then (() => {
                setTimeout(() => {
                    window.location.reload();
                },3000);
            });
        }
        //console.log('Prueba');
        console.log(resultado);

    } catch (error) {
        Swal.fire({
            icon: "error",
            title: "Error",
            text: "Hubo un error al guardar la cita.",
        });
        
    }

}