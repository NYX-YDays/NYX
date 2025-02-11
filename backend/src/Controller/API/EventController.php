<?php

namespace App\Controller\API;

use App\Entity\Event;
use App\Repository\EventRepository;
use App\Repository\UserRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\Validator\Validator\ValidatorInterface;

class EventController extends AbstractController
{
    #[Route('/api/events', name: 'add_event', methods: ['POST'])]
    public function addEvent(Request $request, EntityManagerInterface $entityManager, ValidatorInterface $validator, UserRepository $userRepository): Response
    {
        $data = json_decode($request->getContent(), true);

        $user = $userRepository->find($data['user']);
        if (!$user) {
            return $this->json(['message' => 'User not found'], 404);
        }

        $event = new Event();
        $event->setTitle($data['title']);
        $event->setDescription($data['description']);
        $event->setUser($user);

        $errors = $validator->validate($event);
        if (count($errors) > 0) {
            return $this->json($errors, 400);
        }

        $entityManager->persist($event);
        $entityManager->flush();

        return $this->json($event, 201, [], ['groups' => 'event:read']);
    }

    #[Route('/api/events/{id}', name: 'update_event', methods: ['PUT'])]
    public function updateEvent($id, Request $request, EntityManagerInterface $entityManager, EventRepository $eventRepository, ValidatorInterface $validator) 
    {
        $event = $eventRepository->find($id);
        if (!$event) {
            return $this->json(['error' => 'Event not found'], 404);
        }

        $data = json_decode($request->getContent(), true);

        if(isset($data['title'])) {
            $event->setTitle($data['title']);
        }

        if(isset($data['description'])) {
            $event->setDescription($data['description']);
        }

        $errors = $validator->validate($event);
        if (count($errors) > 0) {
            return $this->json($errors, 400);
        }

        $entityManager->persist($event);
        $entityManager->flush();

        return $this->json($event, 200, [], ['groups' => 'event:read']);
    }

    #[Route('/api/events/{id}', name: 'delete_event', methods: ['DELETE'])]
    public function deleteEvent($id, EntityManagerInterface $entityManager, EventRepository $eventRepository)
    {
        $event = $eventRepository->find($id);
        if (!$event) {
            return $this->json(['error' => 'Event not found'], 404);
        }

        $entityManager->remove($event);
        $entityManager->flush();

        return $this->json(null, 204);
    }
}
