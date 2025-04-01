import { TbDiamondsFilled } from 'react-icons/tb'

export default function About() {
  return (
    <main>
      <div>
        <h2>What is Crowsnest?</h2>
        <p>Crowsnest is the new best way to view college sailing statistics. Crowsnest includes data from 2016 onwards, and ranks uses the data from techscore to rate sailors and make comparisons between teams.</p>
        {/* <br /> */}
        Here are some common terms to remember:
        <ul>
          <li>
            <TbDiamondsFilled className='' style={{ color: 'var(--women)' }} />
            This symbol indicates a women's rating.
          </li>
          <li>
            <strong>Rating:</strong> This is a number that changes based on performance each race. This system was originally invented for chess, but has been used in many other systems where it is necessary to rate individual participants (such as video games or tennis). The algorithm used is not the original ELO formula, it is based on the PlackettLuce model from Openskill.
          </li>
          <li>
            <strong>Percentage:</strong> This is the percentage of the fleet that was beat in each race. If you placed last, you get 0%. If you place first, you get 100%.
          </li>
          <li>
            <strong>Score:</strong> This is the finishing place in the fleet. First place is a score of 1. Tenth is a score of 10.
          </li>
        </ul>
        <span style={{ color: '#777' }}>
          For those wondering, crowsnest is an unfinished solo project of mine. In the future this feature will be just one part of the website. For more info, check out the{' '}
          <a href='https://github.com/7fi/crowsnest' style={{ textDecoration: 'underline' }}>
            GitHub
          </a>
          .
        </span>
      </div>
      <div>
        <h2>Interested in helping?</h2>
        <p>
          We are looking a passionate college sailor who can help us improve the website, or increase the accuracy of our algorithm. A willingness to learn react or python is a must, and experience in either one is highly appreciated. If you are interested please reach out on our{' '}
          <a style={{ textDecoration: 'underline' }} href='https://discord.gg/RxVhg2aUQE/'>
            discord
          </a>
          .
        </p>
      </div>
      <div>
        <h2>Explaination Video</h2>
        <p>I am currently in the process of creating an explaination video that will help users get familar with the website and understand all of it's features. Keep an eye out on our socials for this!</p>
      </div>
    </main>
  )
}
