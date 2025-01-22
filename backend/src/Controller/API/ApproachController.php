<?php

namespace App\Controller\API;

use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;

class ApproachController extends AbstractController
{
    #[Route('/a/p/i/approach', name: 'app_a_p_i_approach')]
    public function index(): Response
    {
        return $this->render('api/approach/index.html.twig', [
            'controller_name' => 'ApproachController',
        ]);
    }
}
