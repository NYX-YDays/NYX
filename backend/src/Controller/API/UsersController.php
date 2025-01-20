<?php

namespace App\Controller\API;

use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\Routing\Annotation\Route;
use App\Entity\Users;
use Symfony\Bundle\SecurityBundle\Security;
use Symfony\Component\HttpFoundation\Request;


class UsersController extends AbstractController
{

    public function __construct(private Security $security) {}

    #[Route('/api/user', methods: ['GET'])]
    public function getCustomer()
    {
        $user = $this->security->getUser();
        if (!empty($user)) {
            return new JsonResponse($user);
        } else {
            return new JsonResponse(null, 404);
        }
    }

    // #[Route('/api/user', methods: ['PUT'])]
    // public function setAdherent(Request $request, EntityManagerInterface $entityManager): JsonResponse
    // {
    //     $data = json_decode($request->getContent(), true);
    //     $user = $this->security->getUser();
    //     if (!isset($user)) return new JsonResponse(null, 404);
    //     if (isset($data['prenom'])) $user->setPrenom($data['prenom']);
    //     if (isset($data['nom'])) $user->setNom($data['nom']);
    //     if (isset($data['photo'])) $user->setPhoto($data['photo']);
    //     if (isset($data['adresse_postale'])) $user->setAdressePostale($data['adresse_postale']);
    //     if (isset($data['date_naissance'])) $user->setDateNaissance(date_create_immutable_from_format('Y-m-d', $data['date_naissance']));
    //     if (isset($data['num_tel'])) $user->setNumTel($data['num_tel']);
    //     $entityManager->persist($user);
    //     $entityManager->flush();
    //     return $this->json($user, JsonResponse::HTTP_CREATED);
    // }
}