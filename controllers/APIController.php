<?php

namespace Controllers;

use Model\Cita;
use Model\CitaServicio;
use Model\Servicio;
use Classes\Email;

class APIController {
    public static function index() {
        $servicios = Servicio::all();
        echo json_encode($servicios);
    }

    public static function guardar() {

        //Almacena la Cita y devuelve el Id de la cita        
        $cita = new Cita($_POST);
        $resultado = $cita->guardar();

        $id = $resultado['id'];

        //Almacena la Cita y el Servicio

        //Almacena los Servicios y el ID de la Cita
        $idServicios = explode(",",$_POST['servicios']);
        foreach ($idServicios as $idServicio) {
            $args = [
                'citaId' => $id,
                'servicioId' => $idServicio
            ];
            $citaServicio = new CitaServicio($args);
            $citaServicio->guardar();
        };

        //Enviar email
        $email = new Email($_SESSION['email'],$_SESSION['nombre'],$id);
        $email->enviarCitas();

        //Retornamos una respuesta

        echo json_encode(['resultado'=> $resultado]);
    }

    public static function eliminar() {

       if($_SERVER['REQUEST_METHOD'] === 'POST') {
            $id = $_POST['id'];
            $cita = Cita::find($id);
            $cita->eliminar();
            header('Location: ' . $_SERVER['HTTP_REFERER']);
            //debuguear($cita);
       }
    }
}

?>