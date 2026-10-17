import TexturePortraits from '~/components/ui-kit/TexturePortraits';
import TexturePortraitsKey from '~/components/ui-kit/TexturePortraits/TexturePortraitsKey';
import PortraitStub from '../PortraitStub';
import Flag from './Flag';

const PartyBar = () => (
  <>
    <TexturePortraitsKey side="left" className="absolute left-[118px] top-[105px]">LB</TexturePortraitsKey>
    <TexturePortraits className="absolute left-[188px] top-[70px]" portrait={<PortraitStub/>} flag={<Flag/>}/>
    <TexturePortraits variant="active" className="absolute left-[320px] top-[54px]" portrait={<PortraitStub/>} flag={<Flag/>}/>
    <TexturePortraitsKey side="right" className="absolute left-[558px] top-[105px]">RB</TexturePortraitsKey>
  </>
);

export default PartyBar;
