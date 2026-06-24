import heroImg from '../../assets/hero.png'

export default function AuthHero() {
  return (
    <div className="flex h-[248px] items-center justify-center bg-gradient-to-b from-[#dff3fb] via-[#c4e9f5] via-60% to-white">
      <img src={heroImg} alt="Snap Cal" className="h-[60px] object-contain" />
    </div>
  )
}
