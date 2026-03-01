import type { Story } from './types';

export const mockStory: Story = {
  storyId: 'mock-story-1',
  title: 'Luna and the Whispering Forest',
  chapters: [
    {
      id: 'ch-1',
      chapterNumber: 1,
      title: 'The Mysterious Path',
      text: `Luna woke up to the sound of birds singing a song she had never heard before. It was soft and sparkly, like tiny bells hidden in the leaves.

She looked out her window and saw something strange — a trail of golden mushrooms glowing at the edge of the garden, leading straight into the Whispering Forest.

"Come on, Hazel!" she called to her little fox companion, who was already wagging his bushy tail by the door.

Together they stepped onto the mossy path. The trees above them were so tall their tops disappeared into clouds. Fireflies danced around them like floating stars.

"Do you hear that?" Luna whispered. The trees were humming — a low, warm sound, like the forest itself was breathing.

Hazel's ears perked up. He tugged Luna's sleeve and pointed his nose toward a clearing where the golden mushrooms gathered in a circle. In the middle sat a tiny owl with feathers the color of moonlight.

"I've been waiting for you," the owl said softly.`,
      illustrations: [
        {
          id: 'ill-1-1',
          imageUrl: '/mocks/mock_image.png',
          altText: 'A young girl looking out her window at glowing golden mushrooms leading into a forest',
          position: 'full-width',
        },
        {
          id: 'ill-1-2',
          imageUrl: '/mocks/mock_image.png',
          altText: 'A small red fox with a bushy tail wagging excitedly by a wooden door',
          position: 'inline',
        },
        {
          id: 'ill-1-3',
          imageUrl: '/mocks/mock_image.png',
          altText: 'A tiny owl with silver moonlight-colored feathers sitting in a circle of golden mushrooms',
          position: 'full-width',
        },
      ],
      audioUrl: 'https://mock-audio.example.com/chapter-1.mp3',
      ecoFact: 'Mushrooms are nature\'s recyclers! They break down old leaves and wood, turning them back into soil that helps new plants grow.',
    },
    {
      id: 'ch-2',
      chapterNumber: 2,
      title: 'The River of Stars',
      text: `Luna chose the path by the singing stream. The water sparkled with tiny lights, like someone had scattered diamonds across its surface.

"Those aren't diamonds," the moonlight owl explained, flying beside her. "Those are star reflections. This stream is so clear it can catch starlight even during the day."

But as they walked further, Luna noticed the sparkles fading. The water grew cloudy. Plastic bottles and old wrappers were caught between the rocks.

"Oh no," Luna said, kneeling by the water. A small silver fish poked its head above the surface.

"Please help us," the fish said. "We used to dance in starlight every night. But now the water is too murky for the stars to reach us."

Hazel was already pulling a bottle from between two stones. Luna rolled up her sleeves.

"We'll help you," she promised.

Together — Luna, Hazel, the owl, and even a family of helpful otters — they spent the afternoon cleaning the stream. Piece by piece, the water grew clearer.

As the sun began to set, the first star appeared in the sky — and its reflection twinkled in the water below. The fish leaped with joy.`,
      illustrations: [
        {
          id: 'ill-2-1',
          imageUrl: '/mocks/mock_image.png',
          altText: 'A crystal-clear stream sparkling with reflected starlight flowing through a green forest',
          position: 'full-width',
        },
        {
          id: 'ill-2-2',
          imageUrl: '/mocks/mock_image.png',
          altText: 'Luna looking sad at a cloudy stream with plastic bottles caught between rocks',
          position: 'inline',
        },
        {
          id: 'ill-2-3',
          imageUrl: '/mocks/mock_image.png',
          altText: 'Luna, a fox, an owl, and otters working together to clean trash from the stream',
          position: 'full-width',
        },
      ],
      audioUrl: 'https://mock-audio.example.com/chapter-2.mp3',
      ecoFact: 'Even one piece of litter can hurt river animals. When we pick up trash near water, we help thousands of fish, frogs, and insects that call the river home!',
    },
    {
      id: 'ch-3',
      chapterNumber: 3,
      title: 'The Starlight Dance',
      text: `That night, something magical happened.

The stream was so clean that it reflected every single star in the sky. The water glowed silver and blue, and the whole forest lit up with gentle light.

The fish began to dance — leaping and spinning, drawing patterns of light in the air. Fireflies joined in, swirling around Luna and Hazel like a living crown of sparkles.

"You did this," the moonlight owl said, landing on Luna's shoulder. "When you care for nature, nature celebrates with you."

Luna laughed as Hazel chased fireflies in circles. The otters splashed and played. Even the trees seemed to sway to a silent song.

The little silver fish swam up to Luna one last time. "Thank you," it said. "Will you come back and visit?"

"Always," Luna promised.

As she and Hazel walked the golden mushroom path back home, Luna looked up at the stars. They seemed to be twinkling just for her.

She whispered to Hazel, "Tomorrow, let's see what else we can help."

Hazel wagged his tail. He already knew the answer was everything.`,
      illustrations: [
        {
          id: 'ill-3-1',
          imageUrl: '/mocks/mock_image.png',
          altText: 'A stream glowing silver and blue reflecting every star, lighting up the whole forest at night',
          position: 'full-width',
        },
        {
          id: 'ill-3-2',
          imageUrl: '/mocks/mock_image.png',
          altText: 'Silver fish leaping and spinning above the water, drawing patterns of light in the air',
          position: 'inline',
        },
        {
          id: 'ill-3-3',
          imageUrl: '/mocks/mock_image.png',
          altText: 'Luna and Hazel the fox walking home along a path of golden glowing mushrooms under the stars',
          position: 'full-width',
        },
      ],
      audioUrl: 'https://mock-audio.example.com/chapter-3.mp3',
      ecoFact: 'Clean rivers and streams are home to thousands of species. A healthy river ecosystem helps filter our drinking water too!',
    },
  ],
  summary: {
    lessonsLearned: [
      'Taking care of nature helps everyone — animals, plants, and people.',
      'Even small actions like picking up one piece of trash can make a big difference.',
      'When we work together, we can solve big problems.',
    ],
    ecoFactsCovered: [
      'Mushrooms are nature\'s recyclers — they break down dead matter into soil.',
      'River pollution hurts thousands of aquatic species.',
      'Clean rivers help filter our drinking water.',
    ],
    choicesMade: [],
  },
};
