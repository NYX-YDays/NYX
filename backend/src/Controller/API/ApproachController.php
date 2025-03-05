<?php

namespace App\Controller\API;

use App\Entity\Approach;
use App\Repository\AdRepository;
use App\Repository\ApproachRepository;
use App\Repository\EventRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
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
        $event = $eventRepository->find($data['event']);
        if (!$event) {
            return $this->json(['error' => 'Event not found'], 404);
        }

        // Trouver l'annonce
        $ad = $adRepository->find($data['ad']);
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
    public function updateApproach($approachId, Request $request, EntityManagerInterface $entityManager, ApproachRepository $approachRepository, ValidatorInterface $validator) {
        
        $approach = $approachRepository->find($approachId);
        if (!$approach) {
            return $this->json(['error' => 'Approach not found'], 404);
        }

        $data = json_decode($request->getContent(), true);

        if(isset($data['state'])) {
            $approach->setState($data['state']);
        }

        $errors = $validator->validate($approach);
        if (count($errors) > 0) {
            return $this->json($errors, 400);
        }

        $entityManager->persist($approach);
        $entityManager->flush();

        return $this->json($approach, 200, [], ['groups' => ['approach:read']]);
    }
}
