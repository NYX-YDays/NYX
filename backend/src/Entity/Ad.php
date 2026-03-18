<?php

namespace App\Entity;

use App\Repository\AdRepository;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use Doctrine\DBAL\Types\Types;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Serializer\Annotation\Groups;

#[ORM\Entity(repositoryClass: AdRepository::class)]
class Ad
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    #[Groups(['event:read', 'ad:read', 'approach:read'])]
    private ?int $id = null;

    #[ORM\Column(length: 255)]
    #[Groups(['event:read', 'ad:read', 'approach:read'])]
    private ?string $title = null;

    #[ORM\Column]
    #[Groups(['ad:read'])]
    private ?float $price = null;

    #[ORM\Column(length: 255)]
    #[Groups(['ad:read'])]
    private ?string $description = null;

    #[ORM\Column(type: Types::DATETIME_MUTABLE)]
    #[Groups(['ad:read'])]
    private ?\DateTimeInterface $dateAd = null;

    #[ORM\Column(type: Types::DATETIME_MUTABLE, nullable: true)]
    #[Groups(['ad:read'])]
    private ?\DateTimeInterface $datePublicationAd = null;

    #[ORM\Column(length: 255)]
    #[Groups(['ad:read'])]
    private ?string $priceIndication = null;

    #[ORM\Column]
    #[Groups(['ad:read'])]
    private ?bool $isVerified = null;

    #[ORM\ManyToOne(inversedBy: 'ads')]
    #[ORM\JoinColumn(nullable: false)]
    #[Groups(['event:read', 'ad:read', 'approach:read'])]
    private ?User $user = null;

    #[ORM\ManyToMany(targetEntity: Category::class, inversedBy: 'ads')]
    #[Groups(['ad:read'])]
    private Collection $categories;

    public function __construct()
    {
        $this->categories = new ArrayCollection();
    }

    public function getId(): ?int
    {
        return $this->id;
    }

    public function getTitle(): ?string
    {
        return $this->title;
    }

    public function setTitle(string $title): static
    {
        $this->title = $title;

        return $this;
    }

    public function getPrice(): ?float
    {
        return $this->price;
    }

    public function setPrice(float $price): static
    {
        $this->price = $price;

        return $this;
    }

    public function getDescription(): ?string
    {
        return $this->description;
    }

    public function setDescription(string $description): static
    {
        $this->description = $description;

        return $this;
    }

    public function getDateAd(): ?\DateTimeInterface
    {
        return $this->dateAd;
    }

    public function setDateAd(\DateTimeInterface $dateEvent): static
    {
        $this->dateAd = $dateEvent;

        return $this;
    }

    public function getDatePublicationAd(): ?\DateTimeInterface
    {
        return $this->datePublicationAd;
    }

    public function setDatePublicationAd(\DateTimeInterface $dateEvent): static
    {
        $this->datePublicationAd = $dateEvent;

        return $this;
    }

    public function getPriceIndication(): ?string
    {
        return $this->priceIndication;
    }

    public function setPriceIndication(string $priceIndication): static
    {
        $this->priceIndication = $priceIndication;

        return $this;
    }

    public function isIsVerified(): ?bool
    {
        return $this->isVerified;
    }

    public function setIsVerified(bool $isVerified): static
    {
        $this->isVerified = $isVerified;

        return $this;
    }

    public function getUser(): ?User
    {
        return $this->user;
    }

    public function setUser(?User $user): static
    {
        $this->user = $user;

        return $this;
    }

    /**
     * @return Collection<int, Category>
     */
    public function getCategories(): Collection
    {
        return $this->categories;
    }

    public function addCategory(Category $category): static
    {
        if (!$this->categories->contains($category)) {
            $this->categories->add($category);
        }

        return $this;
    }

    public function removeCategory(Category $category): static
    {
        $this->categories->removeElement($category);

        return $this;
    }

}
