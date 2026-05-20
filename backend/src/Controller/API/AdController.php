<?php

namespace App\Controller\API;

use App\Entity\Ad;
use App\Repository\AdRepository;
use App\Repository\CategoryRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Bundle\SecurityBundle\Security;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\Validator\Validator\ValidatorInterface;

class AdController extends AbstractController
{

    #[Route('/api/ads', name: 'get_ads', methods: ['GET'])]
    public function getAds(Request $request, AdRepository $adRepository): Response
    {
        // Récupérer le paramètre de catégorie depuis la requête
        $categoryId = $request->query->get('category');
        if ($categoryId) {
            $ads = $adRepository
                ->createQueryBuilder('a')
                ->join('a.categories', 'category')
                ->andWhere('category.id = :categoryId')
                ->andWhere('a.isVerified = 1')
                ->setParameter('categoryId', $categoryId)
                ->getQuery()
                ->getResult();
        } else {
            $ads = $adRepository
                ->createQueryBuilder('a')
                ->where('a.isVerified = 1')
                ->getQuery()
                ->getResult();
        }
        return $this->json($ads, 200, [], ['groups' => 'ad:read']);
    }

    #[Route('/api/categories', name: 'get_categories', methods: ['GET'])]
    public function getCategories(CategoryRepository $categoryRepository): Response
    {
        $categories = $categoryRepository->findAll();
        return $this->json($categories, 200, [], ['groups' => 'ad:read']);
    }

    #[Route('/api/ad/{adId}', name: 'get_ad_by_id', methods: ['GET'])]
    public function getAdById($adId, AdRepository $adRepository): Response
    {
        $ads = $adRepository
            ->createQueryBuilder('a')
            ->where('a.id = :adId')
            //->andWhere('a.isVerified = 1')
            ->setParameter('adId', $adId)
            ->getQuery()
            ->getResult();

        if (!$ads) {
            return $this->json(['error' => 'Ad not found'], 404);
        }
        return $this->json($ads[0], 200, [], ['groups' => 'ad:read']);
    }

    #[Route('/api/ad', name: 'add_ad', methods: ['POST'])]
    public function addAd(Request $request, EntityManagerInterface $entityManager, ValidatorInterface $validator, CategoryRepository $categoryRepository, Security $security)
    {
        $data = json_decode($request->getContent(), true);

        $user = $security->getUser();
        if (!$user) {
            return $this->json(['message' => 'User not found'], 404);
        }

        $ad = new Ad();
        $ad->setTitle($data['title']);
        $ad->setPrice($data['price']);
        $ad->setDescription($data['description']);
        $ad->setDateAd(new \DateTime());
        $ad->setPriceIndication($data['priceIndication']);
        $ad->setIsVerified($data['isVerified']);
        $ad->setUser($user);

        foreach ($data['categories'] as $cat) {
            $category = $categoryRepository->find($cat['id']);
            $ad->addCategory($category);
        }

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

    #[Route('/api/ad/{adId}', name: 'update_ad', methods: ['PUT'])]
    public function updateAd($adId, Request $request, EntityManagerInterface $entityManager, AdRepository $adRepository, ValidatorInterface $validator, CategoryRepository $categoryRepository, Security $security)
    {
        $user = $security->getUser();
        if (!$user) {
            return $this->json(['message' => 'User not found'], 404);
        }

        $ads = $adRepository
            ->createQueryBuilder('a')
            ->join('a.user', 'u')
            ->andWhere('a.id = :adId')
            ->andWhere('u.id = :userId')
            ->setParameter('adId', $adId)
            ->setParameter('userId', $user->getId())
            ->getQuery()
            ->getResult();

        if (!$ads) {
            return $this->json(['error' => 'Ad not found'], 404);
        }

        $ad = $ads[0];

        $data = json_decode($request->getContent(), true);

        if (isset($data['title']))
            $ad->setTitle($data['title']);

        if (isset($data['price']))
            $ad->setPrice($data['price']);

        if (isset($data['description']))
            $ad->setDescription($data['description']);

        if (isset($data['priceIndication']))
            $ad->setPriceIndication($data['priceIndication']);

        // Reset verification
        if (isset($data['isVerified']))
            $ad->setIsVerified(false);

        $ad->clearCategories();
        foreach ($data['categories'] as $cat) {
            $category = $categoryRepository->find($cat['id']);
            $ad->addCategory($category);
        }

        // Mettre à jour automatiquement la date de l'ad
        $ad->setDateAd(new \DateTime());

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

    #[Route('/api/ad/{adId}', name: 'delete_ad', methods: ['DELETE'])]
    public function deleteAd($adId, EntityManagerInterface $entityManager, AdRepository $adRepository, Security $security)
    {
        $user = $security->getUser();
        if (!$user) {
            return $this->json(['message' => 'User not found'], 404);
        }

        $ads = $adRepository
            ->createQueryBuilder('a')
            ->join('a.user', 'u')
            ->andWhere('a.id = :adId')
            ->andWhere('u.id = :userId')
            ->setParameter('adId', $adId)
            ->setParameter('userId', $user->getId())
            ->getQuery()
            ->getResult();

        if (!$ads) {
            return $this->json(['error' => 'Ad not found'], 404);
        }

        $entityManager->remove($ads[0]);
        $entityManager->flush();

        return $this->json(null, 204);
    }
}
