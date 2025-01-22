<?php

namespace App\Controller\API;

use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;

class EventController extends AbstractController
{
    #[Route('/a/p/i/event', name: 'app_a_p_i_event')]
    public function index(): Response
    {
        return $this->render('api/event/index.html.twig', [
            'controller_name' => 'EventController',
        ]);
    }
}
