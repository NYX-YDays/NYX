<?php

namespace App\Controller\API;

use App\Entity\Ad;
use App\Repository\AdRepository;
use App\Repository\UserRepository;
use Doctrine\ORM\EntityManagerInterface;
use Doctrine\ORM\Mapping\Entity;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Bundle\SecurityBundle\Security;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\Validator\Validator\ValidatorInterface;

class AdController extends AbstractController
{

    #[Route('/api/ads', name: 'get_ads', methods: ['GET'])]
    public function getAds(AdRepository $adRepository): Response
    {
        $ads = $adRepository->findAll();
        return $this->json($ads, 200, [], ['groups' => 'ad:read']);
    }

    #[Route('/api/ads/{id}', name: 'get_ad_by_id', methods: ['GET'])]
    public function getAdById($id, AdRepository $adRepository): Response
    {
        $ad = $adRepository->find($id);
        if (!$ad) {
            return $this->json(['error' => 'Ad not found'], 404);
        }
        return $this->json($ad, 200, [], ['groups' => 'ad:read']);
    }

    #[Route('/api/ads', name: 'add_ad', methods: ['POST'])]
    public function addAd(Request $request, EntityManagerInterface $entityManager, ValidatorInterface $validator, UserRepository $userRepository)
    {
        $data = json_decode($request->getContent(), true);
    
        $user = $userRepository->find($data['user']);
        if (!$user) {
            return $this->json(['message' => 'User not found'], 404);
        }

        // Récupérer l'utilisateur connecté
        // $user = $security->getUser();
        // if (!$user || !$user instanceof \App\Entity\User) {
        //     return $this->json(['error' => 'Authenticated user must be a valid User entity.'], 403);
        // }

        $ad = new Ad();
        $ad->setTitle($data['title']);
        $ad->setPrice($data['price']);
        $ad->setDescription($data['description']);
        $ad->setPriceIndication($data['priceIndication']);
        $ad->setIsVerified($data['isVerified']);
        $ad->setUser($user);

        // Validation
        $errors = $validator->validate($ad);
        if (count($errors) > 0) {
            return $this->json($errors, 400);
        }

        // Sauvegarder l'annonce
        $entityManager->persist($ad);
        $entityManager->flush();

        return $this->json($ad, 201, [], ['groups' => 'ad:read']);
    }

    #[Route('/api/ads/{id}', name: 'update_ad', methods: ['PUT'])]
    public function updateAd($id, Request $request, EntityManagerInterface $entityManager, AdRepository $adRepository, ValidatorInterface $validator)
    {
        $ad = $adRepository->find($id);
        if (!$ad) {
            return $this->json(['error' => 'Ad not found'], 404);
        }

        $data = json_decode($request->getContent(), true);

        if(isset($data['title'])) 
            $ad->setTitle($data['title']);

        if(isset($data['price']))
            $ad->setPrice($data['price']);

        if(isset($data['description']))
            $ad->setDescription($data['description']);

        if(isset($data['priceIndication']))
            $ad->setPriceIndication($data['priceIndication']);

        if(isset($data['isVerified']))
            $ad->setIsVerified($data['isVerified']);

        // Validation
        $errors = $validator->validate($ad);
        if (count($errors) > 0) {
            return $this->json($errors, 400);
        }

        // Sauvegarder l'annonce
        $entityManager->persist($ad);
        $entityManager->flush();

        return $this->json($ad, 200, [], ['groups' => 'ad:read']);
    }

    #[Route('/api/ads/{id}', name: 'delete_ad', methods: ['DELETE'])]
    public function deleteAd($id, EntityManagerInterface $entityManager, AdRepository $adRepository)
    {
        $ad = $adRepository->find($id);
        if (!$ad) {
            return $this->json(['error' => 'Ad not found'], 404);
        }

        $entityManager->remove($ad);
        $entityManager->flush();

        return $this->json(null, 204);
    }
}
