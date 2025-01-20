<?php

namespace App\Controller\API;

use Lexik\Bundle\JWTAuthenticationBundle\Services\JWTTokenManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Component\Security\Core\User\UserInterface;

class AuthController extends AbstractController
{

    public function __construct(private JWTTokenManagerInterface $jwtManager) {}

    #[Route('/api/auth', methods: ['POST'])]
    public function login(UserInterface $user)
    {
        $token = $this->jwtManager->create($user);
        return new JsonResponse(['token' => $token, 'user_id' => $user->getUserIdentifier()]);
    }

}