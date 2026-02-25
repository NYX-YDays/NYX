<?php

namespace App\Controller\API;

use App\Entity\Approach;
use App\Repository\AdRepository;
use App\Repository\ApproachRepository;
use App\Repository\EventRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Bundle\SecurityBundle\Security;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\Validator\Validator\ValidatorInterface;

class ApproachController extends AbstractController
{
    #[Route('/api/approach', name: 'add_approach', methods: ['POST'])]
    public function createApproach(Request $request, EntityManagerInterface $entityManager, ValidatorInterface $validator, AdRepository $adRepository, EventRepository $eventRepository): Response {
        
        $data = json_decode($request->getContent(), true);

        // Trouver l'événement
        $event = $eventRepository->find($data['eventId']);
        if (!$event) {
            return $this->json(['error' => 'Event not found'], 404);
        }

        // Trouver l'annonce
        $ad = $adRepository->find($data['adId']);
        if (!$ad) {
            return $this->json(['error' => 'Ad not found'], 404);
        }

        $approach = new Approach();
        $approach->setState(0);
        $approach->setDateNotif(new \DateTime());
        $approach->setMessage($data['message']);
        $approach->setEvent($event);
        $approach->setAd($ad);

        // Valider l'approche
        $errors = $validator->validate($approach);
        if (count($errors) > 0) {
            return $this->json($errors, 400);
        }

        // Persister l'approche
        $entityManager->persist($approach);
        $entityManager->flush();

        return $this->json($approach, 201, [], ['groups' => ['approach:read']]);
    }

    #[Route('/api/approach/{approachId}', name: 'update_approach', methods: ['PUT'])]
    public function updateApproach($approachId, Request $request, EntityManagerInterface $entityManager, ApproachRepository $approachRepository, ValidatorInterface $validator, Security $security): Response {

        // Récupérer l'approche
        $approach = $approachRepository->find($approachId);
        if (!$approach) {
            return $this->json(['error' => 'Approach not found'], 404);
        }

        // Récupérer l'utilisateur connecté
        $currentUser = $security->getUser();
    
        if (!$currentUser) {
            return $this->json(['error' => 'User not authenticated'], 401);
        }

        // Cast de UserInterface vers votre entité User
        if($currentUser instanceof \App\Entity\User) {
            // Récupérer l'utilisateur lié à l'événement
            $eventUser = $approach->getEvent() ? $approach->getEvent()->getUser() : null;

            // Récupérer l'utilisateur lié à l'annonce
            $adUser = $approach->getAd() ? $approach->getAd()->getUser() : null;

            // Vérifier que l'utilisateur connecté est l'utilisateur de l'événement ou de l'annonce
            if (!(($eventUser && $currentUser->getId() == $eventUser->getId()) || ($adUser && $currentUser->getId() == $adUser->getId()))) {
                return $this->json(['error' => 'User not allowed'], 403);
            }
        } else {
            return $this->json(['error' => 'Invalid user type'], 401);
        }

        $data = json_decode($request->getContent(), true);

        if(isset($data['state'])) {
            $approach->setState($data['state']);
        }

        // Valider les modifications
        $errors = $validator->validate($approach);
        if (count($errors) > 0) {
            return $this->json($errors, 400);
        }

        // Persister les modifications
        $entityManager->persist($approach);
        $entityManager->flush();

        return $this->json($approach, 200, [], ['groups' => ['approach:read']]);
    }

}
